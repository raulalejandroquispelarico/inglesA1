import { describe, it, expect } from "vitest";
import { buildQueue, countPendingByUnit } from "../queue";
import type {
  Unit,
  PersistedState,
  ItemState,
  TranslationItem,
} from "@/shared/types";

const FIXED_NOW = new Date("2026-10-13T12:00:00.000Z");
const TOMORROW = new Date("2026-10-14T12:00:00.000Z").toISOString();
const YESTERDAY = new Date("2026-10-12T12:00:00.000Z").toISOString();

function makeItem(id: string): TranslationItem {
  return {
    id,
    kind: "translation",
    skill: "grammar",
    cefr: "A1",
    difficulty: 2,
    tags: ["test"],
    prompt: "Test",
    errorRules: [],
    direction: "es-to-en",
    sourceText: "Test",
    expected: ["Test"],
  };
}

function makeState(overrides: Partial<ItemState> = {}): ItemState {
  return {
    itemId: "item-1",
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

function makeUnit(items: TranslationItem[]): Unit {
  return {
    id: 1,
    slug: "test",
    title: "Test",
    titleEs: "Test",
    cefr: "A1",
    estimatedHours: 1,
    icon: "🧪",
    status: "available",
    objectives: [],
    vocabulary: [],
    grammar: [],
    dialogues: [],
    practice: items,
    evaluation: [],
  };
}

function makeEmptyState(): PersistedState {
  return {
    schemaVersion: 1,
    attempts: [],
    itemStates: {},
    unitProgress: {},
  };
}

describe("buildQueue()", () => {
  it("modo full: devuelve todos los ítems new si no hay estado", () => {
    const unit = makeUnit([makeItem("a"), makeItem("b"), makeItem("c")]);
    const queue = buildQueue(unit, "full", makeEmptyState(), FIXED_NOW);
    expect(queue).toHaveLength(3);
    expect(queue.every((q) => q.state === null)).toBe(true);
  });

  it("modo full: new primero, luego learning, luego review vencidos", () => {
    const unit = makeUnit([makeItem("a"), makeItem("b"), makeItem("c")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "review",
      nextReview: YESTERDAY,
    });
    state.itemStates["b"] = makeState({
      itemId: "b",
      status: "learning",
    });

    const queue = buildQueue(unit, "full", state, FIXED_NOW);
    expect(queue).toHaveLength(3);
    // c es new → primero
    expect(queue[0].item.id).toBe("c");
    // luego b (learning)
    expect(queue[1].item.id).toBe("b");
    // luego a (review vencido)
    expect(queue[2].item.id).toBe("a");
  });

  it("modo full: SÍ incluye review no vencido (cambio v2)", () => {
    const unit = makeUnit([makeItem("a")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "review",
      nextReview: TOMORROW,
    });

    const queue = buildQueue(unit, "full", state, FIXED_NOW);
    expect(queue).toHaveLength(1);
  });

  it("modo full: NO incluye mastered", () => {
    const unit = makeUnit([makeItem("a")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "mastered",
      nextReview: YESTERDAY,
    });

    const queue = buildQueue(unit, "full", state, FIXED_NOW);
    expect(queue).toHaveLength(0);
  });

  it("modo review: solo learning + review vencidos", () => {
    const unit = makeUnit([makeItem("a"), makeItem("b"), makeItem("c")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "learning",
    });
    state.itemStates["b"] = makeState({
      itemId: "b",
      status: "review",
      nextReview: YESTERDAY,
    });
    // c es new → NO debe aparecer en review

    const queue = buildQueue(unit, "review", state, FIXED_NOW);
    expect(queue).toHaveLength(2);
    expect(queue.map((q) => q.item.id).sort()).toEqual(["a", "b"]);
  });

  it("modo free: incluye todo, incluso mastered", () => {
    const unit = makeUnit([
      makeItem("a"),
      makeItem("b"),
      makeItem("c"),
      makeItem("d"),
    ]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({ itemId: "a", status: "learning" });
    state.itemStates["b"] = makeState({
      itemId: "b",
      status: "review",
      nextReview: TOMORROW, // no vencido
    });
    state.itemStates["c"] = makeState({
      itemId: "c",
      status: "mastered",
    });
    // d es new

    const queue = buildQueue(unit, "free", state, FIXED_NOW);
    // new (d) + learning (a) + review (b, incluido aunque no vencido) + mastered (c)
    expect(queue.map((q) => q.item.id).sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("trata estado inconsistente (review sin nextReview) como learning", () => {
    const unit = makeUnit([makeItem("a")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "review",
      nextReview: null,
    });

    const queue = buildQueue(unit, "full", state, FIXED_NOW);
    expect(queue).toHaveLength(1);
    expect(queue[0].item.id).toBe("a");
  });
});

describe("countPendingByUnit()", () => {
  it("cuenta correctamente cada categoría", () => {
    const unit = makeUnit([
      makeItem("a"),
      makeItem("b"),
      makeItem("c"),
      makeItem("d"),
    ]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({ itemId: "a", status: "learning" });
    state.itemStates["b"] = makeState({
      itemId: "b",
      status: "review",
      nextReview: YESTERDAY,
    });
    state.itemStates["c"] = makeState({ itemId: "c", status: "mastered" });
    // d es new

    const counts = countPendingByUnit(unit, state, FIXED_NOW);
    expect(counts.new).toBe(1);
    expect(counts.learning).toBe(1);
    expect(counts.reviewDue).toBe(1);
    expect(counts.mastered).toBe(1);
    expect(counts.total).toBe(4);
  });

  it("con estado vacío: todo es new", () => {
    const unit = makeUnit([makeItem("a"), makeItem("b")]);
    const counts = countPendingByUnit(unit, makeEmptyState(), FIXED_NOW);
    expect(counts.new).toBe(2);
    expect(counts.learning).toBe(0);
    expect(counts.total).toBe(2);
  });
});

// =============================================================================
// Tanda 4-B-1-A: review no vencido en mode full
// =============================================================================

describe("buildQueue() — Tanda 4-B-1-A: review no vencido", () => {
  it("modo full: SÍ incluye review no vencido", () => {
    const unit = makeUnit([makeItem("a")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "review",
      nextReview: TOMORROW, // NO vencido
    });

    const queue = buildQueue(unit, "full", state, FIXED_NOW);
    expect(queue).toHaveLength(1);
    expect(queue[0].item.id).toBe("a");
  });

  it("modo review: NO incluye review no vencido", () => {
    const unit = makeUnit([makeItem("a")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "review",
      nextReview: TOMORROW,
    });

    const queue = buildQueue(unit, "review", state, FIXED_NOW);
    expect(queue).toHaveLength(0);
  });

  it("modo full: incluye learning + review vencido + review no vencido", () => {
    const unit = makeUnit([makeItem("a"), makeItem("b"), makeItem("c")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "learning",
    });
    state.itemStates["b"] = makeState({
      itemId: "b",
      status: "review",
      nextReview: YESTERDAY, // vencido
    });
    state.itemStates["c"] = makeState({
      itemId: "c",
      status: "review",
      nextReview: TOMORROW, // no vencido
    });

    const queue = buildQueue(unit, "full", state, FIXED_NOW);
    expect(queue).toHaveLength(3);
    expect(queue.map((q) => q.item.id).sort()).toEqual(["a", "b", "c"]);
  });
});

describe("countPendingByUnit() — reviewNotDue", () => {
  it("cuenta reviewDue y reviewNotDue por separado", () => {
    const unit = makeUnit([makeItem("a"), makeItem("b")]);
    const state = makeEmptyState();
    state.itemStates["a"] = makeState({
      itemId: "a",
      status: "review",
      nextReview: YESTERDAY, // vencido
    });
    state.itemStates["b"] = makeState({
      itemId: "b",
      status: "review",
      nextReview: TOMORROW, // no vencido
    });

    const counts = countPendingByUnit(unit, state, FIXED_NOW);
    expect(counts.reviewDue).toBe(1);
    expect(counts.reviewNotDue).toBe(1);
    expect(counts.total).toBe(2);
  });
});
