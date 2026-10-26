/**
 * Cola adaptativa.
 * ================
 *
 * Construye la lista ordenada de ítems a presentar en una sesión,
 * en función del modo y del estado del alumno.
 *
 * Función pura: no lee de localStorage, no persiste nada.
 * Recibe `PersistedState` completo y devuelve la cola.
 *
 * Referencia: ARQUITECTURA.md §2.4
 */

import type {
  Unit,
  PracticeItem,
  ItemState,
  PersistedState,
  SessionMode,
} from "@/shared/types";

/**
 * Un elemento de la cola: el ítem a presentar + su estado actual
 * (o null si es `new` y no tiene estado persistido aún).
 */
export interface QueueItem {
  item: PracticeItem;
  state: ItemState | null;
}

/**
 * Construye la cola de práctica de una unidad.
 *
 * Orden:
 *   - mode "full":   new → learning → review vencidos
 *   - mode "review": learning → review vencidos
 *   - mode "free":   todo (new + learning + review + mastered)
 *
 * Un ítem "vence" si `nextReview <= now`. Los ítems sin estado se
 * tratan como `new`.
 */
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
      if (itemState.nextReview === null) {
        // Estado inconsistente: tratar como learning.
        learningItems.push({ item, state: itemState });
      } else if (new Date(itemState.nextReview).getTime() <= nowMs) {
        reviewItems.push({ item, state: itemState });
      }
      // Si no está vencido, no se incluye.
    } else if (itemState.status === "mastered") {
      masteredItems.push({ item, state: itemState });
    }
  }

  switch (mode) {
    case "full":
      return [...newItems, ...learningItems, ...reviewItems];
    case "review":
      return [...learningItems, ...reviewItems];
    case "free":
      return [...newItems, ...learningItems, ...reviewItems, ...masteredItems];
  }
}

/**
 * Cuenta cuántos ítems tiene pendientes una unidad, por categoría.
 * Útil para el Home ("5 ítems pendientes de repaso").
 */
export function countPendingByUnit(
  unit: Unit,
  state: PersistedState,
  now: Date = new Date(),
): {
  new: number;
  learning: number;
  reviewDue: number;
  mastered: number;
  total: number;
} {
  const queue = buildQueue(unit, "free", state, now);

  let newCount = 0;
  let learningCount = 0;
  let reviewDueCount = 0;
  let masteredCount = 0;

  for (const { state: itemState } of queue) {
    if (itemState === null || itemState.status === "new") newCount++;
    else if (itemState.status === "learning") learningCount++;
    else if (itemState.status === "review") reviewDueCount++;
    else if (itemState.status === "mastered") masteredCount++;
  }

  return {
    new: newCount,
    learning: learningCount,
    reviewDue: reviewDueCount,
    mastered: masteredCount,
    total: queue.length,
  };
}
