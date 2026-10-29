/**
 * Historial: persistencia y exportación.
 * ======================================
 *
 * - Carga/guarda PersistedState en localStorage.
 * - Registra intentos y actualiza ItemState (usando spacing.ts).
 * - Exporta el historial a JSON (para re-importar) y a TXT (para IA).
 *
 * En SSR (window undefined): las lecturas devuelven estado vacío y las
 * escrituras no hacen nada.
 *
 * Referencia: ARQUITECTURA.md §2.7 y §4
 */

import type {
  PersistedState,
  Attempt,
  ItemState,
  PracticeItem,
  UnitProgress,
  ExportPayload,
  Unit,
} from "@/shared/types";
import { SCHEMA_VERSION } from "@/shared/types";
import type { EvaluationResult } from "./evaluate";
import { updateSpacing } from "./spacing";
import { normalize } from "./normalize";

// =============================================================================
// Constantes
// =============================================================================

const STORAGE_KEY = "ingles-a1-state-v1";
const ENGINE_VERSION = "1.0.0";

/**
 * Instrucciones que van al inicio del .txt exportado. La IA que lea
 * el informe debe seguirlas al pie de la letra.
 */
const AI_INSTRUCTIONS = `INSTRUCCIÓN PARA LA IA QUE LEE ESTE ARCHIVO:
---------------------------------------------
Eres un generador de contenido pedagógico para un curso de inglés A1
dirigido a hispanohablantes. A continuación recibes el historial de
errores de un alumno. Tu tarea:

1. Identificar los patrones de error más frecuentes (por "tag").
2. Para cada patrón con 3+ ocurrencias, generar 5 ejercicios nuevos
   del MISMO tipo que el original, atacando ese error específico.
3. Cada ejercicio nuevo debe incluir al menos una errorRule que
   detecte exactamente el error que el alumno está cometiendo.
4. Devolver el resultado en formato TypeScript listo para pegar en
   src/content/unit-XX-reinforcement.ts, respetando la interfaz
   PracticeItem definida en src/shared/types.ts.
5. No inventar vocabulario fuera del nivel A1 del MCER.
6. No repetir literalmente los ítems ya presentes en el historial.`;

// =============================================================================
// Estado vacío
// =============================================================================

function emptyState(): PersistedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    attempts: [],
    itemStates: {},
    unitProgress: {},
  };
}

// =============================================================================
// Detección de entorno
// =============================================================================

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof localStorage !== "undefined"
  );
}

// =============================================================================
// Persistencia
// =============================================================================

/**
 * Carga el estado desde localStorage. Devuelve estado vacío en SSR o
 * si hay corrupción. Nunca lanza.
 */
export function loadState(): PersistedState {
  if (!isBrowser()) return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed)) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

/**
 * Guarda el estado. No-op en SSR. Nunca lanza.
 */
export function saveState(state: PersistedState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("ingles-a1-state-updated"));
  } catch (e) {
    console.warn("No se pudo guardar el estado:", e);
  }
}

/**
 * Borra todo el estado del alumno.
 */
export function clearState(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("ingles-a1-state-updated"));
  } catch (e) {
    console.warn("No se pudo borrar el estado:", e);
  }
}

function isValidState(x: unknown): x is PersistedState {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    typeof s.schemaVersion === "number" &&
    Array.isArray(s.attempts) &&
    typeof s.itemStates === "object" &&
    s.itemStates !== null &&
    typeof s.unitProgress === "object" &&
    s.unitProgress !== null
  );
}

// =============================================================================
// Registro de intentos
// =============================================================================

/**
 * Registra un intento y actualiza el ItemState correspondiente.
 * Hace todo en una sola pasada: carga, modifica, guarda.
 *
 * @param item      El PracticeItem que se intentó.
 * @param unitId    ID de la unidad a la que pertenece.
 * @param userAnswer Respuesta cruda del alumno.
 * @param result    Resultado de evaluate().
 */
export function recordAttempt(
  item: PracticeItem,
  unitId: number,
  userAnswer: string,
  result: EvaluationResult,
): void {
  const state = loadState();
  const now = new Date();

  const attempt: Attempt = {
    id: generateId(),
    itemId: item.id,
    unitId,
    skill: item.skill,
    tags: item.tags,
    userAnswer,
    normalizedAnswer: normalize(userAnswer),
    expectedNormalized: result.expectedNormalized,
    correct: result.correct,
    errorTag: result.errorTag ?? undefined,
    diagnosis: result.diagnosis ?? undefined,
    timestamp: now.toISOString(),
  };

  state.attempts.push(attempt);

  const currentState: ItemState =
    state.itemStates[item.id] ?? {
      itemId: item.id,
      unitId,
      status: "new",
      correctStreak: 0,
      ease: 2.5,
      nextReview: null,
      lastSeen: null,
      totalAttempts: 0,
      totalCorrect: 0,
    };

  const spacing = updateSpacing(currentState, result.correct, now);

  state.itemStates[item.id] = {
    ...currentState,
    status: spacing.status,
    correctStreak: spacing.correctStreak,
    ease: spacing.ease,
    nextReview: spacing.nextReview,
    lastSeen: now.toISOString(),
    totalAttempts: currentState.totalAttempts + 1,
    totalCorrect:
      currentState.totalCorrect + (result.correct ? 1 : 0),
  };

  // Actualizar progreso de la unidad.
  state.unitProgress[unitId] = computeUnitProgressInternal(
    unitId,
    state,
    state.unitProgress[unitId],
  );

  saveState(state);
}

/**
 * Actualiza el ItemState de un ítem sin registrar un Attempt.
 * Útil para migraciones o correcciones manuales.
 */
export function updateItemState(
  itemId: string,
  patch: Partial<ItemState>,
): void {
  const state = loadState();
  const current = state.itemStates[itemId];
  if (!current) return;
  state.itemStates[itemId] = { ...current, ...patch };
  saveState(state);
}

/**
 * Devuelve el ItemState de un ítem, o null si nunca se ha visto.
 */
export function getItemState(itemId: string): ItemState | null {
  return loadState().itemStates[itemId] ?? null;
}

// =============================================================================
// Progreso por unidad
// =============================================================================

/**
 * Calcula el UnitProgress de una unidad a partir del estado.
 * Pura: no persiste.
 */
export function computeUnitProgress(
  unitId: number,
  unit: Unit,
  state: PersistedState,
): UnitProgress {
  return computeUnitProgressInternal(
    unitId,
    state,
    state.unitProgress[unitId],
    unit,
  );
}

function computeUnitProgressInternal(
  unitId: number,
  state: PersistedState,
  current: UnitProgress | undefined,
  unit?: Unit,
): UnitProgress {
  const startedAt = current?.startedAt ?? new Date().toISOString();

  // Si no tenemos la Unit, no podemos calcular practiceProgress.
  // Devolvemos lo que ya había, marcando startedAt si es nuevo.
  if (!unit) {
    return (
      current ?? {
        unitId,
        practiceProgress: 0,
        evaluationScore: null,
        evaluationPassed: false,
        startedAt,
      }
    );
  }

  const total = unit.practice.length;
  if (total === 0) {
    return {
      unitId,
      practiceProgress: 0,
      evaluationScore: current?.evaluationScore ?? null,
      evaluationPassed: current?.evaluationPassed ?? false,
      startedAt,
    };
  }

  let mastered = 0;
  for (const item of unit.practice) {
    const s = state.itemStates[item.id];
    if (s && s.status === "mastered") mastered++;
  }

  return {
    unitId,
    practiceProgress: Math.round((mastered / total) * 100),
    evaluationScore: current?.evaluationScore ?? null,
    evaluationPassed: current?.evaluationPassed ?? false,
    startedAt,
    completedAt: current?.completedAt,
  };
}

/**
 * Devuelve el UnitProgress actual de una unidad, o null si nunca se tocó.
 */
export function getUnitProgress(unitId: number): UnitProgress | null {
  return loadState().unitProgress[unitId] ?? null;
}

// =============================================================================
// Exportación
// =============================================================================

/**
 * Exporta el historial como JSON (ExportPayload). Para re-importar o
 * guardar como respaldo.
 */
export function exportAsJson(state: PersistedState = loadState()): ExportPayload {
  const unitsPracticed = Array.from(
    new Set(state.attempts.map((a) => a.unitId)),
  ).sort((a, b) => a - b);

  const totalCorrect = state.attempts.filter((a) => a.correct).length;

  // Resumen por tag de error.
  const tagMap = new Map<
    string,
    { occurrences: number; lastSeen: string; sampleItems: Set<string> }
  >();
  for (const a of state.attempts) {
    if (a.correct || !a.errorTag) continue;
    const existing = tagMap.get(a.errorTag);
    if (existing) {
      existing.occurrences++;
      if (a.timestamp > existing.lastSeen) existing.lastSeen = a.timestamp;
      if (existing.sampleItems.size < 5) existing.sampleItems.add(a.itemId);
    } else {
      tagMap.set(a.errorTag, {
        occurrences: 1,
        lastSeen: a.timestamp,
        sampleItems: new Set([a.itemId]),
      });
    }
  }

  const errorSummary = Array.from(tagMap.entries())
    .map(([tag, v]) => ({
      tag,
      occurrences: v.occurrences,
      lastSeen: v.lastSeen,
      sampleItems: Array.from(v.sampleItems),
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  // Últimos 50 fallos.
  const recentFailures = state.attempts
    .filter((a) => !a.correct)
    .slice(-50);

  return {
    meta: {
      exportedAt: new Date().toISOString(),
      engineVersion: ENGINE_VERSION,
      schemaVersion: state.schemaVersion,
      unitsPracticed,
      totalAttempts: state.attempts.length,
      totalCorrect,
      totalIncorrect: state.attempts.length - totalCorrect,
    },
    errorSummary,
    recentFailures,
    aiInstructions: AI_INSTRUCTIONS,
  };
}

/**
 * Exporta el historial como TXT legible para pegar a una IA.
 */
export function exportAsTxt(state: PersistedState = loadState()): string {
  const payload = exportAsJson(state);
  const lines: string[] = [];

  lines.push("=====================================================================");
  lines.push("INFORME DE PROGRESO — INGLÉS A1");
  lines.push("=====================================================================");
  lines.push(`Fecha de exportación:   ${payload.meta.exportedAt}`);
  lines.push(`Versión del motor:      ${payload.meta.engineVersion}`);
  lines.push(`Versión del esquema:    ${payload.meta.schemaVersion}`);
  lines.push(
    `Unidades cursadas:      ${
      payload.meta.unitsPracticed.join(", ") || "(ninguna)"
    }`,
  );
  lines.push(`Total de intentos:      ${payload.meta.totalAttempts}`);
  lines.push(
    `Aciertos:               ${payload.meta.totalCorrect} (${pct(
      payload.meta.totalCorrect,
      payload.meta.totalAttempts,
    )})`,
  );
  lines.push(
    `Fallos:                 ${payload.meta.totalIncorrect} (${pct(
      payload.meta.totalIncorrect,
      payload.meta.totalAttempts,
    )})`,
  );
  lines.push("=====================================================================");
  lines.push("");
  lines.push(payload.aiInstructions);
  lines.push("");
  lines.push("=====================================================================");
  lines.push("RESUMEN POR TAG DE ERROR");
  lines.push("=====================================================================");

  if (payload.errorSummary.length === 0) {
    lines.push("(Sin errores registrados todavía.)");
  } else {
    const pad = (s: string, n: number) => s.padEnd(n, " ");
    lines.push(
      `${pad("tag", 25)} | ${pad("ocurrencias", 12)} | último visto`,
    );
    lines.push(
      "-".repeat(25) + "-|-" + "-".repeat(12) + "-|" + "-".repeat(20),
    );
    for (const e of payload.errorSummary) {
      lines.push(
        `${pad(e.tag, 25)} | ${pad(String(e.occurrences), 12)} | ${e.lastSeen}`,
      );
    }
  }

  lines.push("");
  lines.push("=====================================================================");
  lines.push(
    `DETALLE DE INTENTOS FALLADOS (últimos ${payload.recentFailures.length})`,
  );
  lines.push("=====================================================================");

  if (payload.recentFailures.length === 0) {
    lines.push("(Sin fallos registrados.)");
  } else {
    for (const a of payload.recentFailures) {
      lines.push(`[${a.timestamp}] item=${a.itemId} tag=${a.errorTag ?? "?"}`);
      lines.push(`  Respuesta del alumno:  ${a.userAnswer}`);
      lines.push(`  Normalizado:           ${a.normalizedAnswer}`);
      lines.push(`  Esperado:              ${a.expectedNormalized.join(" | ")}`);
      if (a.diagnosis) {
        lines.push(`  Diagnóstico:           ${a.diagnosis}`);
      }
      lines.push("");
    }
  }

  lines.push("=====================================================================");
  lines.push("FIN DEL INFORME");
  lines.push("=====================================================================");

  return lines.join("\n");
}

function pct(part: number, total: number): string {
  if (total === 0) return "0.0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

/**
 * Importa un ReinforcementPack generado por IA. Devuelve los ítems
 * listos para agregar a la unidad. NO los persiste (la unidad los
 * lee al cargar).
 */
export function importReinforcement(json: string): PracticeItem[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "items" in parsed &&
      Array.isArray((parsed as { items: unknown }).items)
    ) {
      return (parsed as { items: PracticeItem[] }).items;
    }
    return [];
  } catch {
    return [];
  }
}

// =============================================================================
// Utilidades internas
// =============================================================================

function generateId(): string {
  // crypto.randomUUID() está disponible en navegadores modernos y Node 19+.
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback simple.
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

/**
 * Resetea el progreso de una unidad.
 *
 * - Borra los `itemStates` de los ítems de la unidad.
 * - Resetea el `unitProgress` de esa unidad.
 * - Mantiene los `attempts` (historial de respuestas) para análisis
 *   histórico.
 */
export function resetUnitProgress(
  unitId: number,
  itemIds: string[],
): void {
  const state = loadState();

  for (const id of itemIds) {
    delete state.itemStates[id];
  }
  delete state.unitProgress[unitId];

  saveState(state);
}

