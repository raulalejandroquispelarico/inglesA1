/**
 * API pública del motor adaptativo.
 * ==================================
 *
 * Este es el ÚNICO archivo que los componentes de UI deben importar.
 * Los componentes NO deben importar directamente de evaluate.ts,
 * queue.ts, spacing.ts ni history.ts. Siempre desde acá.
 *
 * Uso típico:
 *   import { evaluate, buildQueue, recordAttempt } from "@/engine";
 *
 * Referencia: ARQUITECTURA.md §2
 */

// --- Normalización (Tanda 1) ---
export { normalize, matchesAny, findMatch, similarity } from "./normalize";

// --- Evaluación y diagnóstico (Tanda 2-A) ---
export { evaluate, serializeErrorRule } from "./evaluate";
export type { EvaluationResult } from "./evaluate";

// --- Repetición espaciada (Tanda 2-A) ---
export { updateSpacing, nextReviewDate } from "./spacing";
export type { SpacingUpdate } from "./spacing";

// --- Cola adaptativa (Tanda 2-B) ---
export { buildQueue, countPendingByUnit } from "./queue";
export type { QueueItem } from "./queue";

// --- Historial y exportación (Tanda 2-B) ---
export {
  loadState,
  saveState,
  clearState,
  recordAttempt,
  updateItemState,
  getItemState,
  getUnitProgress,
  computeUnitProgress,
  exportAsJson,
  exportAsTxt,
  importReinforcement,
  resetUnitProgress,
} from "./history";
