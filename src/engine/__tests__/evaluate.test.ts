import { describe, it, expect } from "vitest";
import { evaluate, serializeErrorRule } from "../evaluate";
import type {
  MatchItem,
  MultipleChoiceItem,
  FillBlankItem,
  WordOrderItem,
  ListeningItem,
  WritingItem,
  TranslationItem,
  ReadingItem,
} from "@/shared/types";

// =============================================================================
// Fixtures
// =============================================================================

const baseItem = {
  cefr: "A1" as const,
  difficulty: 2 as const,
  tags: ["test"],
  prompt: "Test prompt",
  errorRules: [],
};

const translationItem: TranslationItem = {
  ...baseItem,
  id: "to-001",
  kind: "translation",
  skill: "grammar",
  direction: "es-to-en",
  sourceText: "Yo quiero aprender inglés.",
  expected: ["I want to learn English"],
  errorRules: [
    {
      match: /\bwant\s+(?!to\b)\w+/,
      diagnosis: "Falta 'to' antes del verbo base.",
      rule: "Después de 'want', usa 'to' + verbo: 'want to learn'.",
      example: "I want to learn English.",
      tag: "to-verb",
    },
  ],
};

const multipleChoiceItem: MultipleChoiceItem = {
  ...baseItem,
  id: "mc-001",
  kind: "multiple-choice",
  skill: "grammar",
  options: ["am", "is", "are"],
  expected: ["is"],
  distractors: {
    am: "Con 'she' no se usa 'am'.",
    are: "Con 'she' no se usa 'are'.",
  },
};

const fillBlankItem: FillBlankItem = {
  ...baseItem,
  id: "fb-001",
  kind: "fill-blank",
  skill: "grammar",
  blanks: [
    { before: "She", after: "a teacher.", expected: ["is"] },
    { before: "We", after: "students.", expected: ["are"] },
  ],
};

const wordOrderItem: WordOrderItem = {
  ...baseItem,
  id: "wo-001",
  kind: "word-order",
  skill: "grammar",
  words: ["name", "is", "My", "Ana"],
  expected: ["My name is Ana"],
};

const listeningItem: ListeningItem = {
  ...baseItem,
  id: "li-001",
  kind: "listening",
  skill: "listening",
  audioText: "What's your name?",
  question: "¿Qué te preguntan?",
  choices: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?"],
  expected: ["¿Cómo te llamas?"],
};

const writingItem: WritingItem = {
  ...baseItem,
  id: "wr-001",
  kind: "writing",
  skill: "writing",
  rubric: ["Incluye tu nombre", "Incluye de dónde eres"],
  minLength: 20,
};

const matchItem: MatchItem = {
  ...baseItem,
  id: "ma-001",
  kind: "match",
  skill: "vocab",
  pairs: [
    { left: "Hello", right: "Hola" },
    { left: "Goodbye", right: "Adiós" },
  ],
};

// =============================================================================
// evaluate() — Translation
// =============================================================================

describe("evaluate() — translation", () => {
  it("acepta respuesta exacta", () => {
    const r = evaluate(translationItem, "I want to learn English");
    expect(r.correct).toBe(true);
    expect(r.matchedExpected).toBe("I want to learn English");
    expect(r.errorTag).toBeNull();
  });

  it("acepta con puntuación final y mayúsculas distintas", () => {
    const r = evaluate(translationItem, "i want to learn english.");
    expect(r.correct).toBe(true);
  });

  it("detecta falta de 'to' y aplica la errorRule", () => {
    const r = evaluate(translationItem, "I want learn English");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("to-verb");
    expect(r.diagnosis).toBe("Falta 'to' antes del verbo base.");
    expect(r.rule).toContain("want to learn");
    expect(r.example).toBe("I want to learn English.");
  });

  it("marca unclassified si falla y ninguna regla matchea", () => {
    const r = evaluate(translationItem, "xyz");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("unclassified");
    expect(r.diagnosis).toBeNull();
  });

  it("calcula similarity > 0 para respuestas parecidas", () => {
    const r = evaluate(translationItem, "I want to learn Spanish");
    expect(r.correct).toBe(false);
    expect(r.similarity).toBeGreaterThan(0.5);
    expect(r.similarity).toBeLessThan(1);
  });

  it("expone expectedNormalized y normalizedAnswer", () => {
    const r = evaluate(translationItem, "I want learn English");
    expect(r.expectedNormalized).toEqual(["i want to learn english"]);
    expect(r.normalizedAnswer).toBe("i want learn english");
  });

  it("acepta variantes con acceptableAnswers", () => {
    const item: TranslationItem = {
      ...translationItem,
      id: "to-002",
      acceptableAnswers: ["I would like to learn English"],
    };
    const r = evaluate(item, "I would like to learn English");
    expect(r.correct).toBe(true);
    expect(r.matchedExpected).toBe("I would like to learn English");
  });
});

// =============================================================================
// evaluate() — Multiple choice
// =============================================================================

describe("evaluate() — multiple-choice", () => {
  it("acepta la opción correcta", () => {
    const r = evaluate(multipleChoiceItem, "is");
    expect(r.correct).toBe(true);
    expect(r.matchedExpected).toBe("is");
  });

  it("rechaza opción incorrecta con diagnóstico del distractor", () => {
    const r = evaluate(multipleChoiceItem, "are");
    expect(r.correct).toBe(false);
    expect(r.diagnosis).toBe("Con 'she' no se usa 'are'.");
  });

  it("rechaza opción desconocida con unclassified", () => {
    const r = evaluate(multipleChoiceItem, "was");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("unclassified");
  });
});

// =============================================================================
// evaluate() — Fill blank
// =============================================================================

describe("evaluate() — fill-blank", () => {
  it("acepta todas las respuestas correctas", () => {
    const r = evaluate(fillBlankItem, JSON.stringify(["is", "are"]));
    expect(r.correct).toBe(true);
  });

  it("rechaza si una respuesta es incorrecta", () => {
    const r = evaluate(fillBlankItem, JSON.stringify(["are", "are"]));
    expect(r.correct).toBe(false);
  });

  it("rechaza si el número de respuestas no coincide", () => {
    const r = evaluate(fillBlankItem, JSON.stringify(["is"]));
    expect(r.correct).toBe(false);
    expect(r.diagnosis).toContain("Número de respuestas");
  });

  it("rechaza si no es JSON válido", () => {
    const r = evaluate(fillBlankItem, "no es json");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("unclassified");
  });
});

// =============================================================================
// evaluate() — Word order
// =============================================================================

describe("evaluate() — word-order", () => {
  it("acepta la frase correcta", () => {
    const r = evaluate(wordOrderItem, "My name is Ana");
    expect(r.correct).toBe(true);
  });

  it("acepta con puntuación final", () => {
    const r = evaluate(wordOrderItem, "My name is Ana.");
    expect(r.correct).toBe(true);
  });

  it("rechaza frase en orden incorrecto", () => {
    const r = evaluate(wordOrderItem, "Ana is my name");
    expect(r.correct).toBe(false);
  });
});

// =============================================================================
// evaluate() — Listening
// =============================================================================

describe("evaluate() — listening", () => {
  it("acepta la opción correcta", () => {
    const r = evaluate(listeningItem, "¿Cómo te llamas?");
    expect(r.correct).toBe(true);
  });

  it("rechaza opción incorrecta", () => {
    const r = evaluate(listeningItem, "¿Cómo estás?");
    expect(r.correct).toBe(false);
  });
});

// =============================================================================
// evaluate() — Writing
// =============================================================================

describe("evaluate() — writing", () => {
  it("acepta texto que cumple minLength", () => {
    const r = evaluate(writingItem, "My name is Juan. I am from Bolivia.");
    expect(r.correct).toBe(true);
  });

  it("rechaza texto demasiado corto con tag too-short", () => {
    const r = evaluate(writingItem, "Hi");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("too-short");
  });

  it("rechaza texto vacío", () => {
    const r = evaluate(writingItem, "");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("too-short");
  });
});

// =============================================================================
// evaluate() — Match
// =============================================================================

describe("evaluate() — match", () => {
  it("acepta si todas las parejas son correctas", () => {
    const answer = JSON.stringify({ Hello: "Hola", Goodbye: "Adiós" });
    const r = evaluate(matchItem, answer);
    expect(r.correct).toBe(true);
  });

  it("rechaza si una pareja es incorrecta", () => {
    const answer = JSON.stringify({ Hello: "Adiós", Goodbye: "Hola" });
    const r = evaluate(matchItem, answer);
    expect(r.correct).toBe(false);
  });

  it("rechaza si el JSON no es válido", () => {
    const r = evaluate(matchItem, "no es json");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("unclassified");
  });
});

// =============================================================================
// serializeErrorRule()
// =============================================================================

describe("serializeErrorRule()", () => {
  it("convierte RegExp a source + flags", () => {
    const rule = translationItem.errorRules[0];
    const serialized = serializeErrorRule(rule);
    expect(serialized.matchSource).toBe(rule.match.source);
    expect(serialized.matchFlags).toBe(rule.match.flags);
    expect(serialized.tag).toBe("to-verb");
  });

  it("produce un objeto serializable a JSON sin errores", () => {
    const rule = translationItem.errorRules[0];
    const serialized = serializeErrorRule(rule);
    expect(() => JSON.stringify(serialized)).not.toThrow();
  });
});

// =============================================================================
// runErrorRules — reset de lastIndex
// =============================================================================

describe("evaluate() — lastIndex en RegExp globales", () => {
  it("no deja lastIndex contaminado entre llamadas", () => {
    const item: TranslationItem = {
      ...translationItem,
      id: "test-global",
      errorRules: [
        {
          match: /want/g,
          diagnosis: "Test",
          rule: "Test",
          example: "Test",
          tag: "test",
        },
      ],
    };
    const r1 = evaluate(item, "want");
    expect(r1.errorTag).toBe("test");
    const r2 = evaluate(item, "want");
    expect(r2.errorTag).toBe("test");
  });
});

// =============================================================================
// evaluate() — Reading (NUEVO en Tanda 4-B-0)
// =============================================================================

const readingItem: ReadingItem = {
  ...baseItem,
  id: "rd-001",
  kind: "reading",
  skill: "reading",
  sourceText:
    "Ana is from Bolivia. She is a teacher. She has two brothers and one sister.",
  question: "Where is Ana from?",
  choices: ["Bolivia", "Peru", "Spain"],
  expected: ["Bolivia"],
};

describe("evaluate() — reading", () => {
  it("acepta la opción correcta", () => {
    const r = evaluate(readingItem, "Bolivia");
    expect(r.correct).toBe(true);
    expect(r.matchedExpected).toBe("Bolivia");
  });

  it("rechaza opción incorrecta", () => {
    const r = evaluate(readingItem, "Peru");
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe("unclassified");
  });

  it("respeta mayúsculas/minúsculas (normaliza)", () => {
    const r = evaluate(readingItem, "bolivia");
    expect(r.correct).toBe(true);
  });

  it("expone expectedNormalized y normalizedAnswer", () => {
    const r = evaluate(readingItem, "Peru");
    expect(r.expectedNormalized).toEqual(["bolivia"]);
    expect(r.normalizedAnswer).toBe("peru");
  });
});
