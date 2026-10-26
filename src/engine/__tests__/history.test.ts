import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loadState,
  saveState,
  clearState,
  recordAttempt,
  getItemState,
  exportAsJson,
  exportAsTxt,
  importReinforcement,
} from "../history";
import type { PersistedState, TranslationItem } from "@/shared/types";
import { SCHEMA_VERSION } from "@/shared/types";

// =============================================================================
// Mock de localStorage (Vitest corre en node sin DOM).
// =============================================================================

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};
  get length(): number {
    return Object.keys(this.store).length;
  }
  clear(): void {
    this.store = {};
  }
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  key(i: number): string | null {
    return Object.keys(this.store)[i] ?? null;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

const localStorageMock = new MemoryStorage();

beforeEach(() => {
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: localStorageMock,
    dispatchEvent: () => true,
  };
  (globalThis as unknown as { localStorage: unknown }).localStorage =
    localStorageMock;
  localStorageMock.clear();
});

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
  delete (globalThis as unknown as { localStorage?: unknown }).localStorage;
});

// =============================================================================
// Fixtures
// =============================================================================

function makeItem(id: string): TranslationItem {
  return {
    id,
    kind: "translation",
    skill: "grammar",
    cefr: "A1",
    difficulty: 2,
    tags: ["to-verb"],
    prompt: "Test",
    errorRules: [],
    direction: "es-to-en",
    sourceText: "Test",
    expected: ["Test"],
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("loadState() / saveState() / clearState()", () => {
  it("loadState devuelve estado vacío si no hay nada", () => {
    const state = loadState();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.attempts).toEqual([]);
    expect(state.itemStates).toEqual({});
  });

  it("saveState persiste y loadState recupera", () => {
    const state: PersistedState = {
      schemaVersion: SCHEMA_VERSION,
      attempts: [],
      itemStates: {},
      unitProgress: {},
    };
    saveState(state);
    const loaded = loadState();
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("clearState borra todo", () => {
    const state: PersistedState = {
      schemaVersion: SCHEMA_VERSION,
      attempts: [],
      itemStates: {},
      unitProgress: {},
    };
    saveState(state);
    clearState();
    const loaded = loadState();
    expect(loaded.attempts).toEqual([]);
  });

  it("loadState maneja JSON corrupto devolviendo estado vacío", () => {
    localStorageMock.setItem("ingles-a1-state-v1", "no es json");
    const state = loadState();
    expect(state.attempts).toEqual([]);
  });

  it("en SSR (sin window) loadState devuelve estado vacío sin lanzar", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { localStorage?: unknown }).localStorage;
    const state = loadState();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
  });
});

describe("recordAttempt()", () => {
  it("registra un intento correcto y actualiza ItemState", () => {
    const item = makeItem("a");
    recordAttempt(item, 1, "Test", {
      correct: true,
      matchedExpected: "Test",
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized: ["test"],
      normalizedAnswer: "test",
    });

    const state = loadState();
    expect(state.attempts).toHaveLength(1);
    expect(state.attempts[0].correct).toBe(true);

    const itemState = state.itemStates["a"];
    expect(itemState).toBeDefined();
    expect(itemState.status).toBe("learning");
    expect(itemState.totalAttempts).toBe(1);
    expect(itemState.totalCorrect).toBe(1);
  });

  it("registra un intento fallido con errorTag", () => {
    const item = makeItem("a");
    recordAttempt(item, 1, "want learn", {
      correct: false,
      matchedExpected: null,
      errorTag: "to-verb",
      diagnosis: "Falta 'to'",
      rule: "want to",
      example: "I want to learn",
      similarity: 0.8,
      expectedNormalized: ["i want to learn"],
      normalizedAnswer: "want learn",
    });

    const state = loadState();
    expect(state.attempts).toHaveLength(1);
    expect(state.attempts[0].correct).toBe(false);
    expect(state.attempts[0].errorTag).toBe("to-verb");
    expect(state.attempts[0].diagnosis).toBe("Falta 'to'");
  });

  it("acumula intentos de múltiples ítems", () => {
    const a = makeItem("a");
    const b = makeItem("b");
    const result = {
      correct: true,
      matchedExpected: "Test",
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized: ["test"],
      normalizedAnswer: "test",
    };

    recordAttempt(a, 1, "Test", result);
    recordAttempt(b, 1, "Test", result);

    const state = loadState();
    expect(state.attempts).toHaveLength(2);
    expect(Object.keys(state.itemStates)).toHaveLength(2);
  });
});

describe("getItemState()", () => {
  it("devuelve null para un ítem nunca visto", () => {
    expect(getItemState("nunca-visto")).toBeNull();
  });

  it("devuelve el estado tras registrar un intento", () => {
    const item = makeItem("a");
    recordAttempt(item, 1, "Test", {
      correct: true,
      matchedExpected: "Test",
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized: ["test"],
      normalizedAnswer: "test",
    });
    const s = getItemState("a");
    expect(s).not.toBeNull();
    expect(s!.status).toBe("learning");
  });
});

describe("exportAsJson()", () => {
  it("con estado vacío devuelve payload válido", () => {
    const payload = exportAsJson();
    expect(payload.meta.totalAttempts).toBe(0);
    expect(payload.meta.totalCorrect).toBe(0);
    expect(payload.errorSummary).toEqual([]);
    expect(payload.recentFailures).toEqual([]);
    expect(payload.aiInstructions).toContain("INSTRUCCIÓN PARA LA IA");
  });

  it("resume errores por tag", () => {
    const item = makeItem("a");
    const failResult = {
      correct: false,
      matchedExpected: null,
      errorTag: "to-verb",
      diagnosis: "Falta to",
      rule: "want to",
      example: "I want to",
      similarity: 0.5,
      expectedNormalized: ["test"],
      normalizedAnswer: "test",
    };
    recordAttempt(item, 1, "want learn", failResult);
    recordAttempt(item, 1, "want learn", failResult);
    recordAttempt(item, 1, "want study", failResult);

    const payload = exportAsJson();
    expect(payload.errorSummary).toHaveLength(1);
    expect(payload.errorSummary[0].tag).toBe("to-verb");
    expect(payload.errorSummary[0].occurrences).toBe(3);
  });

  it("incluye solo últimos 50 fallos en recentFailures", () => {
    const item = makeItem("a");
    const failResult = {
      correct: false,
      matchedExpected: null,
      errorTag: "unclassified",
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 0.5,
      expectedNormalized: ["test"],
      normalizedAnswer: "test",
    };
    for (let i = 0; i < 60; i++) {
      recordAttempt(item, 1, "x", failResult);
    }
    const payload = exportAsJson();
    expect(payload.recentFailures).toHaveLength(50);
  });
});

describe("exportAsTxt()", () => {
  it("genera texto con cabecera e instrucciones para IA", () => {
    const txt = exportAsTxt();
    expect(txt).toContain("INFORME DE PROGRESO — INGLÉS A1");
    expect(txt).toContain("INSTRUCCIÓN PARA LA IA");
    expect(txt).toContain("RESUMEN POR TAG DE ERROR");
    expect(txt).toContain("FIN DEL INFORME");
  });

  it("incluye los tags de error en el resumen", () => {
    const item = makeItem("a");
    recordAttempt(item, 1, "want learn", {
      correct: false,
      matchedExpected: null,
      errorTag: "to-verb",
      diagnosis: "Falta to",
      rule: "want to",
      example: "I want to",
      similarity: 0.5,
      expectedNormalized: ["test"],
      normalizedAnswer: "test",
    });
    const txt = exportAsTxt();
    expect(txt).toContain("to-verb");
  });
});

describe("importReinforcement()", () => {
  it("parsea un ReinforcementPack válido", () => {
    const pack = {
      unitId: 1,
      generatedAt: new Date().toISOString(),
      targets: ["to-verb"],
      items: [makeItem("new-1"), makeItem("new-2")],
    };
    const items = importReinforcement(JSON.stringify(pack));
    expect(items).toHaveLength(2);
  });

  it("devuelve [] para JSON inválido", () => {
    expect(importReinforcement("no es json")).toEqual([]);
  });

  it("devuelve [] si no tiene items", () => {
    expect(importReinforcement(JSON.stringify({ foo: "bar" }))).toEqual([]);
  });
});
