/**
 * Repetición espaciada — SM-2 simplificado.
 * =========================================
 *
 * Actualiza el estado de un ítem (correctStreak, ease, nextReview,
 * status) tras un intento. No persiste nada (eso es history.ts).
 *
 * Referencia: ARQUITECTURA.md §2.5
 */

import type { ItemState, ItemStatus } from "@/shared/types";
import { MASTERY_STREAK } from "@/shared/types";

/**
 * Cambios a aplicar a un ItemState tras un intento.
 * Es un delta, no el estado completo: history.ts lo aplica.
 */
export interface SpacingUpdate {
  status: ItemStatus;
  correctStreak: number;
  ease: number;
  nextReview: string | null;
}

/**
 * Días de espera base para el modo review/mastered.
 */
const INTERVAL_BASE_DAYS = 1;

/**
 * Calcula el próximo intervalo en días.
 */
function computeIntervalDays(
  status: ItemStatus,
  ease: number,
  correct: boolean,
): number {
  if (!correct) return 1;

  switch (status) {
    case "new":
      return 1;
    case "learning":
      return 3;
    case "review":
    case "mastered":
      return Math.max(INTERVAL_BASE_DAYS, Math.round(ease * 3));
  }
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Calcula la fecha del próximo repaso (ISO string).
 */
export function nextReviewDate(
  status: ItemStatus,
  ease: number,
  correct: boolean,
  now: Date = new Date(),
): string {
  const days = computeIntervalDays(status, ease, correct);
  return addDays(now, days).toISOString();
}

/**
 * Dado el ItemState actual y si el intento fue correcto, devuelve el
 * SpacingUpdate a aplicar.
 */
export function updateSpacing(
  current: ItemState,
  correct: boolean,
  now: Date = new Date(),
): SpacingUpdate {
  if (!correct) {
    return {
      status: "learning",
      correctStreak: 0,
      ease: Math.max(1.3, current.ease - 0.2),
      nextReview: nextReviewDate("learning", current.ease, false, now),
    };
  }

  if (current.status === "new") {
    return {
      status: "learning",
      correctStreak: 1,
      ease: 2.5,
      nextReview: nextReviewDate("new", 2.5, true, now),
    };
  }

  const newStreak = current.correctStreak + 1;
  const newEase = Math.min(2.8, current.ease + 0.1);
  const newStatus: ItemStatus =
    newStreak >= MASTERY_STREAK ? "mastered" : "review";

  return {
    status: newStatus,
    correctStreak: newStreak,
    ease: newEase,
    nextReview: nextReviewDate(newStatus, newEase, true, now),
  };
}
