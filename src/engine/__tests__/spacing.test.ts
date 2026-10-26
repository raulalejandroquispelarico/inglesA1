import { describe, it, expect } from "vitest";
import { updateSpacing, nextReviewDate } from "../spacing";
import type { ItemState } from "@/shared/types";

const FIXED_NOW = new Date("2026-10-13T12:00:00.000Z");

function makeState(overrides: Partial<ItemState> = {}): ItemState {
  return {
    itemId: "test-001",
    unitId: 1,
    status: "new",
    correctStreak: 0,
    ease: 2.5,
    nextReview: null,
    lastSeen: null,
    totalAttempts: 0,
    totalCorrect: 0,
    ...overrides,
  };
}

describe("updateSpacing()", () => {
  it("primer acierto en new: pasa a learning, streak=1, ease=2.5", () => {
    const state = makeState({ status: "new" });
    const update = updateSpacing(state, true, FIXED_NOW);
    expect(update.status).toBe("learning");
    expect(update.correctStreak).toBe(1);
    expect(update.ease).toBe(2.5);
    expect(update.nextReview).not.toBeNull();
  });

  it("fallo: vuelve a learning, streak=0, ease baja 0.2", () => {
    const state = makeState({
      status: "review",
      correctStreak: 3,
      ease: 2.5,
    });
    const update = updateSpacing(state, false, FIXED_NOW);
    expect(update.status).toBe("learning");
    expect(update.correctStreak).toBe(0);
    expect(update.ease).toBeCloseTo(2.3, 5);
  });

  it("fallo: ease no baja de 1.3", () => {
    const state = makeState({ ease: 1.4 });
    const update = updateSpacing(state, false, FIXED_NOW);
    expect(update.ease).toBe(1.3);
  });

  it("acierto en learning: streak++, ease sube 0.1, pasa a review", () => {
    const state = makeState({
      status: "learning",
      correctStreak: 1,
      ease: 2.5,
    });
    const update = updateSpacing(state, true, FIXED_NOW);
    expect(update.status).toBe("review");
    expect(update.correctStreak).toBe(2);
    expect(update.ease).toBeCloseTo(2.6, 5);
  });

  it("acierto en review: ease no sube de 2.8", () => {
    const state = makeState({
      status: "review",
      correctStreak: 1,
      ease: 2.8,
    });
    const update = updateSpacing(state, true, FIXED_NOW);
    expect(update.ease).toBe(2.8);
  });

  it("3 aciertos consecutivos: pasa a mastered", () => {
    const state = makeState({
      status: "review",
      correctStreak: 2,
      ease: 2.5,
    });
    const update = updateSpacing(state, true, FIXED_NOW);
    expect(update.status).toBe("mastered");
    expect(update.correctStreak).toBe(3);
  });

  it("nextReview siempre en el futuro", () => {
    const state = makeState({ status: "new" });
    const update = updateSpacing(state, true, FIXED_NOW);
    expect(update.nextReview).not.toBeNull();
    const next = new Date(update.nextReview!);
    expect(next.getTime()).toBeGreaterThan(FIXED_NOW.getTime());
  });
});

describe("nextReviewDate()", () => {
  it("fallo: devuelve mañana", () => {
    const iso = nextReviewDate("learning", 2.5, false, FIXED_NOW);
    const d = new Date(iso);
    const expected = new Date(FIXED_NOW);
    expected.setDate(expected.getDate() + 1);
    expect(d.toDateString()).toBe(expected.toDateString());
  });

  it("acierto en new: devuelve mañana", () => {
    const iso = nextReviewDate("new", 2.5, true, FIXED_NOW);
    const d = new Date(iso);
    const expected = new Date(FIXED_NOW);
    expected.setDate(expected.getDate() + 1);
    expect(d.toDateString()).toBe(expected.toDateString());
  });

  it("acierto en review: intervalo proporcional a ease", () => {
    const iso25 = nextReviewDate("review", 2.5, true, FIXED_NOW);
    const iso20 = nextReviewDate("review", 2.0, true, FIXED_NOW);
    const days25 = (new Date(iso25).getTime() - FIXED_NOW.getTime()) / 86400000;
    const days20 = (new Date(iso20).getTime() - FIXED_NOW.getTime()) / 86400000;
    expect(days25).toBeGreaterThan(days20);
  });
});
