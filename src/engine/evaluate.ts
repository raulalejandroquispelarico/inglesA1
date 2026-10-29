/**
 * Evaluación de respuestas y diagnóstico de errores.
 * ===================================================
 *
 * Responsabilidad única: dado un PracticeItem y la respuesta del alumno,
 * decidir si es correcta, y si no, diagnosticar POR QUÉ falló.
 *
 * No persiste nada (eso es history.ts).
 * No construye colas (eso es queue.ts).
 * No actualiza spacing (eso es spacing.ts).
 *
 * Referencia: ARQUITECTURA.md §2.6
 */

import type {
  PracticeItem,
  ErrorRule,
  SerializedErrorRule,
} from "@/shared/types";
import { normalize, matchesAny, findMatch, similarity } from "./normalize";

/**
 * Resultado de evaluar una respuesta. Es lo que la UI consume para
 * mostrar feedback y lo que history.ts usa para registrar el intento.
 */
export interface EvaluationResult {
  /** Si la respuesta fue correcta. */
  correct: boolean;

  /**
   * La variante esperada que coincidió (si fue correcta).
   * null si fue incorrecta.
   */
  matchedExpected: string | null;

  /**
   * Tag del ErrorRule que matcheó (si fue incorrecta y hubo match).
   * "unclassified" si fue incorrecta pero ninguna regla matcheó.
   * null si fue correcta.
   */
  errorTag: string | null;

  /** Diagnóstico del error (si hubo match). */
  diagnosis: string | null;

  /** Regla gramatical que se rompió (si hubo match). */
  rule: string | null;

  /** Ejemplo correcto (si hubo match). */
  example: string | null;

  /**
   * Similitud 0-1 entre la respuesta del alumno y la esperada.
   * Solo se calcula si fue incorrecta (para feedback tipo
   * "se parece al 80%, revisa si te falta una palabra").
   * 1 si fue correcta.
   */
  similarity: number;

  /**
   * Respuestas esperadas normalizadas (para que history.ts las guarde
   * en el Attempt y la exportación a IA tenga el contexto completo).
   */
  expectedNormalized: string[];

  /** Respuesta del alumno normalizada (para history.ts). */
  normalizedAnswer: string;
}

/**
 * Evalúa la respuesta del alumno contra un PracticeItem.
 *
 * Es la ÚNICA función que la UI debe llamar para evaluar.
 * Despacha por item.kind internamente.
 */
export function evaluate(
  item: PracticeItem,
  userAnswer: string,
): EvaluationResult {
  switch (item.kind) {
    case "match":
      return evaluateMatch(item, userAnswer);
    case "multiple-choice":
      return evaluateMultipleChoice(item, userAnswer);
    case "fill-blank":
      return evaluateFillBlank(item, userAnswer);
    case "word-order":
      return evaluateWordOrder(item, userAnswer);
    case "listening":
      return evaluateListening(item, userAnswer);
    case "writing":
      return evaluateWriting(item, userAnswer);
    case "translation":
      return evaluateTranslation(item, userAnswer);
    case "reading":
      return evaluateReading(item, userAnswer);
  }
}

// =============================================================================
// Evaluadores por tipo
// =============================================================================

/**
 * Match: el alumno empareja columnas. La "respuesta" es un JSON que
 * mapea cada `left` a su `right` elegido. Ej:
 *   '{"Hello":"Hola","Goodbye":"Adiós"}'
 *
 * Se considera correcto si TODAS las parejas están bien.
 */
function evaluateMatch(
  item: Extract<PracticeItem, { kind: "match" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const parsed = tryParseMatchAnswer(userAnswer);

  // Si no se puede parsear, es un fallo de formato.
  if (!parsed) {
    return {
      correct: false,
      matchedExpected: null,
      errorTag: "unclassified",
      diagnosis: "Formato de respuesta inválido para emparejar.",
      rule: null,
      example: null,
      similarity: 0,
      expectedNormalized: [],
      normalizedAnswer,
    };
  }

  const allCorrect = item.pairs.every(
    (p) => parsed[p.left] === p.right,
  );

  if (allCorrect) {
    return {
      correct: true,
      matchedExpected: userAnswer,
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized: [],
      normalizedAnswer,
    };
  }

  // Falló: corremos errorRules contra la representación serializada.
  const serialized = JSON.stringify(parsed);
  const diagnosisResult = runErrorRules(item.errorRules, serialized);
  const expectedNormalized = item.pairs.map((p) =>
    normalize(`${p.left} = ${p.right}`),
  );

  return {
    correct: false,
    matchedExpected: null,
    errorTag: diagnosisResult?.tag ?? "unclassified",
    diagnosis: diagnosisResult?.diagnosis ?? null,
    rule: diagnosisResult?.rule ?? null,
    example: diagnosisResult?.example ?? null,
    similarity: 0,
    expectedNormalized,
    normalizedAnswer,
  };
}

/**
 * Multiple choice: el alumno elige una opción.
 * La respuesta es la opción elegida (string).
 */
function evaluateMultipleChoice(
  item: Extract<PracticeItem, { kind: "multiple-choice" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const expectedNormalized = item.expected.map(normalize);
  const matched = findMatch(userAnswer, item.expected);

  if (matched !== null) {
    return {
      correct: true,
      matchedExpected: matched,
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized,
      normalizedAnswer,
    };
  }

  const diagnosisResult = runErrorRules(item.errorRules, userAnswer);

  return {
    correct: false,
    matchedExpected: null,
    errorTag: diagnosisResult?.tag ?? "unclassified",
    diagnosis:
      diagnosisResult?.diagnosis ??
      item.distractors?.[userAnswer] ??
      null,
    rule: diagnosisResult?.rule ?? null,
    example: diagnosisResult?.example ?? null,
    similarity: similarity(userAnswer, item.expected[0] ?? ""),
    expectedNormalized,
    normalizedAnswer,
  };
}

/**
 * Fill blank: el alumno completa varios huecos.
 * La respuesta es un JSON array con los valores de cada hueco. Ej:
 *   '["is","are","am"]'
 */
function evaluateFillBlank(
  item: Extract<PracticeItem, { kind: "fill-blank" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const values = tryParseFillBlankAnswer(userAnswer);

  if (!values || values.length !== item.blanks.length) {
    return {
      correct: false,
      matchedExpected: null,
      errorTag: "unclassified",
      diagnosis: "Número de respuestas no coincide con los huecos.",
      rule: null,
      example: null,
      similarity: 0,
      expectedNormalized: item.blanks.map((b) => normalize(b.expected[0] ?? "")),
      normalizedAnswer,
    };
  }

  const allCorrect = item.blanks.every((blank, i) =>
    matchesAny(values[i], blank.expected),
  );

  if (allCorrect) {
    return {
      correct: true,
      matchedExpected: userAnswer,
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized: item.blanks.map((b) => normalize(b.expected[0] ?? "")),
      normalizedAnswer,
    };
  }

  const serialized = values.join(" | ");
  const diagnosisResult = runErrorRules(item.errorRules, serialized);

  return {
    correct: false,
    matchedExpected: null,
    errorTag: diagnosisResult?.tag ?? "unclassified",
    diagnosis: diagnosisResult?.diagnosis ?? null,
    rule: diagnosisResult?.rule ?? null,
    example: diagnosisResult?.example ?? null,
    similarity: 0,
    expectedNormalized: item.blanks.map((b) => normalize(b.expected[0] ?? "")),
    normalizedAnswer,
  };
}

/**
 * Word order: el alumno ordena palabras.
 * La respuesta es la frase construida (string).
 */
function evaluateWordOrder(
  item: Extract<PracticeItem, { kind: "word-order" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const expectedNormalized = item.expected.map(normalize);
  const matched = findMatch(userAnswer, item.expected);

  if (matched !== null) {
    return {
      correct: true,
      matchedExpected: matched,
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized,
      normalizedAnswer,
    };
  }

  const diagnosisResult = runErrorRules(item.errorRules, userAnswer);

  return {
    correct: false,
    matchedExpected: null,
    errorTag: diagnosisResult?.tag ?? "unclassified",
    diagnosis: diagnosisResult?.diagnosis ?? null,
    rule: diagnosisResult?.rule ?? null,
    example: diagnosisResult?.example ?? null,
    similarity: similarity(userAnswer, item.expected[0] ?? ""),
    expectedNormalized,
    normalizedAnswer,
  };
}

/**
 * Listening: el alumno escucha audio y elige una opción.
 * Igual que multiple-choice en cuanto a evaluación.
 */
function evaluateListening(
  item: Extract<PracticeItem, { kind: "listening" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const expectedNormalized = item.expected.map(normalize);
  const matched = findMatch(userAnswer, item.expected);

  if (matched !== null) {
    return {
      correct: true,
      matchedExpected: matched,
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized,
      normalizedAnswer,
    };
  }

  const diagnosisResult = runErrorRules(item.errorRules, userAnswer);

  return {
    correct: false,
    matchedExpected: null,
    errorTag: diagnosisResult?.tag ?? "unclassified",
    diagnosis: diagnosisResult?.diagnosis ?? null,
    rule: diagnosisResult?.rule ?? null,
    example: diagnosisResult?.example ?? null,
    similarity: similarity(userAnswer, item.expected[0] ?? ""),
    expectedNormalized,
    normalizedAnswer,
  };
}

/**
 * Writing: producción libre. No se evalúa automáticamente (eso lo hace
 * una IA a partir del historial exportado). Solo se valida longitud
 * mínima y que no esté vacío.
 */
function evaluateWriting(
  item: Extract<PracticeItem, { kind: "writing" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const minLength = item.minLength ?? 5;

  if (userAnswer.trim().length < minLength) {
    return {
      correct: false,
      matchedExpected: null,
      errorTag: "too-short",
      diagnosis: `La respuesta es demasiado corta (mínimo ${minLength} caracteres).`,
      rule: null,
      example: item.model ?? null,
      similarity: 0,
      expectedNormalized: [],
      normalizedAnswer,
    };
  }

  // Se considera "correcto" en el sentido de "completado". La calidad
  // se evalúa offline vía IA con la rúbrica exportada en el historial.
  return {
    correct: true,
    matchedExpected: null,
    errorTag: null,
    diagnosis: null,
    rule: null,
    example: null,
    similarity: 1,
    expectedNormalized: [],
    normalizedAnswer,
  };
}

/**
 * Translation: el alumno traduce un texto.
 * Es el tipo que más se beneficia de errorRules.
 */
function evaluateTranslation(
  item: Extract<PracticeItem, { kind: "translation" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const expectedNormalized = item.expected.map(normalize);
  const matched = findMatch(
    userAnswer,
    item.expected,
    item.acceptableAnswers,
  );

  if (matched !== null) {
    return {
      correct: true,
      matchedExpected: matched,
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized,
      normalizedAnswer,
    };
  }

  const diagnosisResult = runErrorRules(item.errorRules, userAnswer);

  return {
    correct: false,
    matchedExpected: null,
    errorTag: diagnosisResult?.tag ?? "unclassified",
    diagnosis: diagnosisResult?.diagnosis ?? null,
    rule: diagnosisResult?.rule ?? null,
    example: diagnosisResult?.example ?? null,
    similarity: similarity(userAnswer, item.expected[0] ?? ""),
    expectedNormalized,
    normalizedAnswer,
  };
}


/**
 * Evaluación de comprensión lectora.
 * Igual que listening pero sin audio: el alumno lee el texto y elige.
 */
function evaluateReading(
  item: Extract<PracticeItem, { kind: "reading" }>,
  userAnswer: string,
): EvaluationResult {
  const normalizedAnswer = normalize(userAnswer);
  const expectedNormalized = item.expected.map(normalize);
  const matched = findMatch(userAnswer, item.expected);

  if (matched !== null) {
    return {
      correct: true,
      matchedExpected: matched,
      errorTag: null,
      diagnosis: null,
      rule: null,
      example: null,
      similarity: 1,
      expectedNormalized,
      normalizedAnswer,
    };
  }

  const diagnosisResult = runErrorRules(item.errorRules, userAnswer);

  return {
    correct: false,
    matchedExpected: null,
    errorTag: diagnosisResult?.tag ?? "unclassified",
    diagnosis: diagnosisResult?.diagnosis ?? null,
    rule: diagnosisResult?.rule ?? null,
    example: diagnosisResult?.example ?? null,
    similarity: similarity(userAnswer, item.expected[0] ?? ""),
    expectedNormalized,
    normalizedAnswer,
  };
}

// =============================================================================
// Helpers internos
// =============================================================================

/**
 * Corre las errorRules en orden. La primera que matchee gana.
 * Devuelve null si ninguna matchea.
 *
 * IMPORTANTE: el match se prueba contra `normalize(userAnswer)` para
 * que la regla no se vea afectada por mayúsculas/puntos que ya
 * normalizamos. Pero algunas reglas necesitan el texto crudo (ej:
 * detectar mayúscula faltante en un nombre propio). Por eso se prueba
 * contra ambos: primero normalizado, y si falla, contra crudo.
 */
function runErrorRules(
  rules: ErrorRule[],
  userAnswer: string,
): ErrorRule | null {
  const normalized = normalize(userAnswer);

  for (const rule of rules) {
    // RegExp con flag "g" o "y" mantiene lastIndex entre llamadas.
    // Reseteamos para evitar falsos negativos.
    rule.match.lastIndex = 0;
    if (rule.match.test(normalized)) {
      return rule;
    }
    // Segunda pasada contra el texto crudo (por si la regla depende
    // de mayúsculas o puntuación que normalize() eliminó).
    rule.match.lastIndex = 0;
    if (rule.match.test(userAnswer)) {
      return rule;
    }
  }

  return null;
}

/**
 * Intenta parsear la respuesta de un match. Formato esperado:
 * JSON con { left: right, ... }.
 */
function tryParseMatchAnswer(raw: string): Record<string, string> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v !== "string") return null;
        result[k] = v;
      }
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Intenta parsear la respuesta de un fill-blank. Formato esperado:
 * JSON array con los valores de cada hueco.
 */
function tryParseFillBlankAnswer(raw: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed as string[];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Serializa una ErrorRule (RegExp → string) para guardar en historial.
 * Exportada porque history.ts la necesita al construir ExportPayload.
 */
export function serializeErrorRule(rule: ErrorRule): SerializedErrorRule {
  return {
    matchSource: rule.match.source,
    matchFlags: rule.match.flags,
    diagnosis: rule.diagnosis,
    rule: rule.rule,
    example: rule.example,
    tag: rule.tag,
  };
}
