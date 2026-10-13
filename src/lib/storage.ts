/**
 * Helper de almacenamiento local para el progreso del curso.
 * Persiste progreso por unidad + puntaje de evaluación en localStorage.
 * Compatible con PWA offline-first.
 */

const STORAGE_KEY = "ingles-a1-progress-v1";

export interface UnitProgress {
  // Porcentaje 0-100 de la lección completada (tabs visitadas, ejercicios resueltos)
  progress: number;
  // Puntaje de la evaluación final (0-100)
  evaluationScore?: number;
  // Timestamps
  startedAt?: string;
  completedAt?: string;
  // Tabs visitadas
  visitedTabs?: string[];
}

export interface CourseProgress {
  [unitId: number]: UnitProgress;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadProgress(): CourseProgress {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CourseProgress;
  } catch {
    return {};
  }
}

export function saveProgress(progress: CourseProgress): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    // Disparamos un evento custom para que los componentes suscritos se actualicen
    window.dispatchEvent(new CustomEvent("ingles-a1-progress-updated"));
  } catch (e) {
    console.warn("No se pudo guardar el progreso:", e);
  }
}

export function getUnitProgress(unitId: number): UnitProgress {
  const all = loadProgress();
  return (
    all[unitId] ?? {
      progress: 0,
      visitedTabs: [],
    }
  );
}

export function updateUnitProgress(
  unitId: number,
  patch: Partial<UnitProgress>
): void {
  const all = loadProgress();
  const current = all[unitId] ?? {
    progress: 0,
    visitedTabs: [],
  };
  const updated: UnitProgress = {
    ...current,
    ...patch,
    visitedTabs: patch.visitedTabs
      ? Array.from(new Set([...(current.visitedTabs ?? []), ...patch.visitedTabs]))
      : current.visitedTabs,
  };
  // Si no se proporcionó startedAt y la unidad es nueva, lo seteamos
  if (!updated.startedAt) updated.startedAt = new Date().toISOString();
  all[unitId] = updated;
  saveProgress(all);
}

/**
 * Calcula el porcentaje general del curso basado en unidades con contenido.
 * Por ahora solo la unidad 1 tiene contenido (peso 100% del progreso efectivo).
 */
export function getOverallCourseProgress(): number {
  const all = loadProgress();
  // 12 unidades en total; cada una vale ~8.33%
  // Solo la unidad 1 puede tener progreso real ahora
  let total = 0;
  for (let i = 1; i <= 12; i++) {
    const unit = all[i];
    if (unit?.progress) {
      total += unit.progress / 12;
    }
  }
  return Math.round(total);
}
