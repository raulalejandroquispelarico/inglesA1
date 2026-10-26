/**
 * Normalización de texto para comparación de respuestas.
 * ======================================================
 *
 * Problema real que resuelve (detectado en producción, versión HTML "TO"):
 *   - Distintos apóstrofes Unicode (' ' ` ´ ʹ ʼ ʽ) hacían que respuestas
 *     correctas se marcaran como incorrectas.
 *   - Mayúsculas iniciales generaban falsos negativos ("Hello" vs "hello").
 *   - Puntos/comas finales generaban falsos negativos ("I go home." vs "I go home").
 *   - Espacios múltiples ("I   go") no colapsaban.
 *
 * Estrategia:
 *   1. Normalización Unicode NFKC (descompone ligaduras, unifica compatibilidad).
 *   2. Unificar todos los apóstrofes conocidos a ASCII '.
 *   3. Unificar comillas dobles a ASCII ".
 *   4. Unificar guiones largos a guion simple -.
 *   5. Colapsar espacios múltiples.
 *   6. Trim.
 *   7. Eliminar puntuación FINAL (.,;:!?) — no en medio de la frase.
 *   8. Lowercase AL FINAL (para no afectar pasos anteriores).
 *
 * Lo que NO se normaliza (a propósito):
 *   - Acentos en español: son errores reales si aparecen en inglés.
 *   - Puntuación interna: "I go, home" ≠ "I go home" (error real).
 *   - Puntuación en medio de contracciones: "I'm" debe conservar el apóstrofe.
 *
 * Referencia: ARQUITECTURA.md §2.3
 */

/**
 * Normaliza un texto para comparación. Idempotente: normalize(normalize(x)) === normalize(x).
 */
export function normalize(input: string): string {
  if (typeof input !== "string") {
    throw new TypeError(`normalize() esperaba string, recibió ${typeof input}`);
  }

  return (
    input
      // 0. Pre-reemplazar acento agudo U+00B4 ANTES de NFKC.
      //    NFKC descompone U+00B4 en espacio + U+0301, causando "I 'm" en vez de "I'm".
      .replace(/\u00B4/g, "'")

      // 1. Normalización Unicode de compatibilidad.
      .normalize("NFKC")

      // 2. Unificar apóstrofes tipográficos a ASCII (incluye U+0301 que NFKC pueda generar).
      .replace(/[\u2018\u2019\u0060\u0301\u02B9\u02BC\u02BD\u2032\u2035]/g, "'")

      // 3. Unificar comillas dobles a ASCII.
      .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A]/g, '"')

      // 4. Unificar guiones largos y medios a guion simple.
      .replace(/[\u2013\u2014\u2212\u2010]/g, "-")

      // 5. Colapsar espacios múltiples (incluye tabs, saltos de línea, NBSP).
      .replace(/\s+/g, " ")

      // 6. Trim.
      .trim()

      // 7. Eliminar puntuación FINAL.
      .replace(/[.,;:!?\u2026]+$/, "")

      // 8. Lowercase AL FINAL.
      .toLowerCase()
  );
}

/**
 * Compara dos textos tras normalizarlos.
 */
export function matchesAny(
  userAnswer: string,
  expected: string | string[],
  acceptable?: string[],
): boolean {
  const normalized = normalize(userAnswer);
  const expectedArr = Array.isArray(expected) ? expected : [expected];
  const candidates = [
    ...expectedArr.map(normalize),
    ...(acceptable ?? []).map(normalize),
  ];
  return candidates.includes(normalized);
}

/**
 * Devuelve la primera respuesta esperada que coincida, o null si ninguna.
 */
export function findMatch(
  userAnswer: string,
  expected: string | string[],
  acceptable?: string[],
): string | null {
  const normalized = normalize(userAnswer);
  const all = [
    ...(Array.isArray(expected) ? expected : [expected]),
    ...(acceptable ?? []),
  ];
  for (const candidate of all) {
    if (normalize(candidate) === normalized) {
      return candidate;
    }
  }
  return null;
}

/**
 * Calcula un "score" de similitud entre dos textos normalizados (0–1).
 * Se usa para diagnóstico cuando ninguna ErrorRule matcheó.
 */
export function similarity(a: string, b: string): number {
  const s1 = normalize(a);
  const s2 = normalize(b);

  if (s1.length === 0 || s2.length === 0) return 0;
  if (s1 === s2) return 1;

  const dist = levenshtein(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - dist / maxLen;
}

/**
 * Distancia de Levenshtein (iterativa).
 */
function levenshtein(a: string, b: string): number {
  if (a.length < b.length) [a, b] = [b, a];

  const m = a.length;
  const n = b.length;
  let prevRow = Array.from({ length: n + 1 }, (_, i) => i);
  let currRow = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,
        prevRow[j] + 1,
        prevRow[j - 1] + cost,
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[n];
}

