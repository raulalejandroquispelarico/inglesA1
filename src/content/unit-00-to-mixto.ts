/**
 * Unidad 00 — Piloto mixto (7 tipos de ítem).
 * ============================================
 *
 * Un ítem de cada tipo, todos sobre el tema "TO" o introducciones
 * básicas, para validar visualmente que los 7 componentes funcionan.
 *
 * NO se usa en la app real. Solo en /piloto-mixto.
 */

import type { Unit } from "@/shared/types";

export const UNIT_00_MIXTO: Unit = {
  id: -1,
  slug: "piloto-mixto",
  title: "Piloto mixto — 7 tipos",
  titleEs: "Piloto mixto — 7 tipos de ejercicio",
  cefr: "A1",
  estimatedHours: 1,
  icon: "🧪",
  status: "available",
  objectives: ["Validar los 7 tipos de PracticeItem."],
  vocabulary: [],
  grammar: [],
  dialogues: [],
  practice: [
    // 1. translation
    {
      id: "mix-001",
      kind: "translation",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-verb"],
      prompt: "Traduce al inglés.",
      direction: "es-to-en",
      sourceText: "Yo quiero aprender inglés.",
      expected: ["I want to learn English"],
      errorRules: [
        {
          match: /\bwant\s+(?!to\b)\w+/,
          diagnosis: "Falta 'to' antes del verbo base.",
          rule: "Después de 'want', usa 'to' + verbo.",
          example: "I want to learn English.",
          tag: "to-verb",
        },
      ],
    },

    // 2. multiple-choice
    {
      id: "mix-002",
      kind: "multiple-choice",
      skill: "grammar",
      cefr: "A1",
      difficulty: 1,
      tags: ["to-be"],
      prompt: "Elige la opción correcta: 'She ___ from Peru.'",
      options: ["am", "is", "are"],
      expected: ["is"],
      errorRules: [],
      distractors: {
        am: "Con 'she' no se usa 'am'.",
        are: "Con 'she' no se usa 'are'.",
      },
    },

    // 3. fill-blank
    {
      id: "mix-003",
      kind: "fill-blank",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be"],
      prompt: "Completa con 'am', 'is' o 'are'.",
      blanks: [
        { before: "She", after: "a teacher.", expected: ["is"] },
        { before: "We", after: "students.", expected: ["are"] },
        { before: "I", after: "from Bolivia.", expected: ["am"] },
      ],
      errorRules: [],
    },

    // 4. word-order
    {
      id: "mix-004",
      kind: "word-order",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["word-order-basic"],
      prompt: "Ordena las palabras para formar una frase correcta.",
      words: ["name", "is", "My", "Ana"],
      expected: ["My name is Ana"],
      errorRules: [],
    },

    // 5. listening
    {
      id: "mix-005",
      kind: "listening",
      skill: "listening",
      cefr: "A1",
      difficulty: 2,
      tags: ["listening-basic"],
      prompt: "Escucha la pregunta y elige la respuesta correcta.",
      audioText: "What's your name?",
      question: "¿Qué te preguntan?",
      choices: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?"],
      expected: ["¿Cómo te llamas?"],
      errorRules: [],
    },

    // 6. writing
    {
      id: "mix-006",
      kind: "writing",
      skill: "writing",
      cefr: "A1",
      difficulty: 3,
      tags: ["writing-basic"],
      prompt:
        "Escribe tu presentación personal. Incluye tu nombre, de dónde eres, y cómo estás.",
      model: "Hi! My name is [Name]. I am from [City]. I am [fine/good/happy].",
      rubric: [
        "Usa 'My name is...'",
        "Usa 'I am from...'",
        "Al menos 10 caracteres",
      ],
      minLength: 10,
      errorRules: [],
    },

    // 7. match
    {
      id: "mix-007",
      kind: "match",
      skill: "vocab",
      cefr: "A1",
      difficulty: 1,
      tags: ["greetings"],
      prompt: "Empareja cada saludo con su traducción.",
      pairs: [
        { left: "Hello", right: "Hola" },
        { left: "Goodbye", right: "Adiós" },
        { left: "Good morning", right: "Buenos días" },
        { left: "See you later", right: "Nos vemos luego" },
      ],
      errorRules: [],
    },
  ],
  evaluation: [],
};
