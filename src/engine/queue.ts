/**
 * Cola adaptativa.
 * ================
 *
 * Construye la lista ordenada de ítems a presentar en una sesión,
 * en función del modo y del estado del alumno.
 *
 * Función pura: no lee de localStorage, no persiste nada.
 *
 * Semántica de modos (v2, cambia en Tanda 4-B-1-A):
 *   - "full":   todos los ítems NO dominados (new + learning + review).
 *               Review incluye VENCIDOS Y NO VENCIDOS. El spacing solo
 *               prioriza, no bloquea al alumno que quiere practicar hoy.
 *   - "review": solo learning + review VENCIDOS. Es el modo estricto
 *               de repaso programado.
 *   - "free":   todo, incluidos mastered. Para repaso libre.
 */

import type {
  Unit,
  PracticeItem,
  ItemState,
  PersistedState,
  SessionMode,
} from "@/shared/types";

export interface QueueItem {
  item: PracticeItem;
  state: ItemState | null;
}

export function buildQueue(
  unit: Unit,
  mode: SessionMode,
  state: PersistedState,
  now: Date = new Date(),
): QueueItem[] {
  const allItems = unit.practice;
  const nowMs = now.getTime();

  const newItems: QueueItem[] = [];
  const learningItems: QueueItem[] = [];
  const reviewItems: QueueItem[] = [];
  const masteredItems: QueueItem[] = [];

  for (const item of allItems) {
    const itemState = state.itemStates[item.id] ?? null;

    if (itemState === null || itemState.status === "new") {
      newItems.push({ item, state: itemState });
    } else if (itemState.status === "learning") {
      learningItems.push({ item, state: itemState });
    } else if (itemState.status === "review") {
      // En "full" se incluyen siempre; en "review" solo si vencidos.
      // Lo decidimos al construir la cola final según el modo.
      reviewItems.push({ item, state: itemState });
    } else if (itemState.status === "mastered") {
      masteredItems.push({ item, state: itemState });
    }
  }

  // Filtrar reviewItems según el modo.
  const reviewDue = reviewItems.filter(({ state: s }) => {
    if (!s || s.nextReview === null) return true; // inconsistente → incluir
    return new Date(s.nextReview).getTime() <= nowMs;
  });

  switch (mode) {
    case "full":
      // Todos los no dominados, sin importar nextReview.
      return [...newItems, ...learningItems, ...reviewItems];
    case "review":
      // Solo learning + review vencidos.
      return [...learningItems, ...reviewDue];
    case "free":
      // Todo.
      return [
        ...newItems,
        ...learningItems,
        ...reviewItems,
        ...masteredItems,
      ];
  }
}

/**
 * Cuenta cuántos ítems tiene pendientes una unidad, por categoría.
 */
export function countPendingByUnit(
  unit: Unit,
  state: PersistedState,
  now: Date = new Date(),
): {
  new: number;
  learning: number;
  reviewDue: number;
  reviewNotDue: number;
  mastered: number;
  total: number;
} {
  const nowMs = now.getTime();
  let newCount = 0;
  let learningCount = 0;
  let reviewDueCount = 0;
  let reviewNotDueCount = 0;
  let masteredCount = 0;

  for (const item of unit.practice) {
    const s = state.itemStates[item.id];
    if (!s || s.status === "new") newCount++;
    else if (s.status === "learning") learningCount++;
    else if (s.status === "review") {
      if (s.nextReview === null) reviewDueCount++;
      else if (new Date(s.nextReview).getTime() <= nowMs) reviewDueCount++;
      else reviewNotDueCount++;
    } else if (s.status === "mastered") masteredCount++;
  }

  return {
    new: newCount,
    learning: learningCount,
    reviewDue: reviewDueCount,
    reviewNotDue: reviewNotDueCount,
    mastered: masteredCount,
    total:
      newCount +
      learningCount +
      reviewDueCount +
      reviewNotDueCount +
      masteredCount,
  };
}
