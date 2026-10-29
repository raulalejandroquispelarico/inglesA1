/**
 * CONTRATO MOTOR ↔ CONTENIDO
 * ==========================
 *
 * Este archivo define TODOS los tipos que el motor (src/engine/) y el
 * contenido (src/content/) comparten. Ninguna de las dos capas debe
 * definir tipos propios que no estén aquí.
 *
 * Si necesitas un tipo nuevo, agrégalo aquí y bumpea CONTRACT_VERSION.
 *
 * Reglas:
 *   - src/engine/  SOLO puede importar de este archivo (y de libs).
 *   - src/content/ SOLO puede importar de este archivo (y de libs).
 *   - Los componentes (src/components/) importan de aquí + del engine.
 *
 * Versión del contrato: 1.0.0
 * Última actualización: 2026-10-13
 */

// =============================================================================
// 1. PRIMITIVAS Y ENUMS
// =============================================================================

/** Niveles del Marco Común Europeo de Referencia. */
export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/**
 * Competencia que evalúa un ítem.
 * Un ítem = UNA competencia. No mezclar.
 */
export type Skill =
  | "vocab"
  | "grammar"
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

/** Dificultad pedagógica del ítem. */
export type Difficulty = 1 | 2 | 3;

/** Estado de un ítem en el historial de un alumno. */
export type ItemStatus = "new" | "learning" | "review" | "mastered";

/** Modo de sesión de práctica. */
export type SessionMode = "full" | "review" | "free";

// =============================================================================
// 2. REGLAS DE ERROR
// =============================================================================

export interface ErrorRule {
  match: RegExp;
  diagnosis: string;
  rule: string;
  example: string;
  tag: string;
}

export interface SerializedErrorRule {
  matchSource: string;
  matchFlags: string;
  diagnosis: string;
  rule: string;
  example: string;
  tag: string;
}

// =============================================================================
// 3. ÍTEMS DE PRÁCTICA (discriminated union por `kind`)
// =============================================================================

export interface PracticeItemBase {
  id: string;
  skill: Skill;
  cefr: CEFR;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  hint?: string;
  explanation?: string;
  errorRules: ErrorRule[];
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchItem extends PracticeItemBase {
  kind: "match";
  pairs: MatchPair[];
}

export interface MultipleChoiceItem extends PracticeItemBase {
  kind: "multiple-choice";
  options: string[];
  expected: string[];
  distractors?: Record<string, string>;
}

export interface Blank {
  before: string;
  after: string;
  expected: string[];
}

export interface FillBlankItem extends PracticeItemBase {
  kind: "fill-blank";
  blanks: Blank[];
}

export interface WordOrderItem extends PracticeItemBase {
  kind: "word-order";
  words: string[];
  expected: string[];
}

export interface ListeningItem extends PracticeItemBase {
  kind: "listening";
  audioText: string;
  question: string;
  choices: string[];
  expected: string[];
}

export interface WritingItem extends PracticeItemBase {
  kind: "writing";
  model?: string;
  rubric: string[];
  minLength?: number;
}

export interface TranslationItem extends PracticeItemBase {
  kind: "translation";
  direction: "es-to-en" | "en-to-es";
  sourceText: string;
  expected: string[];
  acceptableAnswers?: string[];
}

/**
 * Comprensión lectora. El alumno lee un texto corto y responde
 * una pregunta de comprensión eligiendo una opción.
 */
export interface ReadingItem extends PracticeItemBase {
  kind: "reading";
  /** Texto a leer. Puede ser 1-3 frases para A1. */
  sourceText: string;
  /** Pregunta de comprensión sobre el texto. */
  question: string;
  /** Opciones de respuesta. */
  choices: string[];
  /** Respuesta(s) correcta(s). */
  expected: string[];
}

export type PracticeItem =
  | MatchItem
  | MultipleChoiceItem
  | FillBlankItem
  | WordOrderItem
  | ListeningItem
  | WritingItem
  | TranslationItem
  | ReadingItem;

export type PracticeItemKind = PracticeItem["kind"];

// =============================================================================
// 4. UNIDAD Y CONTENIDO
// =============================================================================

export interface VocabItem {
  word: string;
  pronunciation: string;
  translation: string;
  category: string;
  emoji?: string;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: { en: string; es: string }[];
  tip?: string;
}

export interface DialogueLine {
  speaker: string;
  en: string;
  es: string;
}

export interface Dialogue {
  title: string;
  context: string;
  lines: DialogueLine[];
  speakerRoles?: Record<string, "female1" | "female2" | "male1" | "male2">;
}

export type UnitStatus = "available" | "locked" | "coming-soon";

export interface Unit {
  id: number;
  slug: string;
  title: string;
  titleEs: string;
  cefr: CEFR;
  estimatedHours: number;
  icon: string;
  status: UnitStatus;
  objectives: string[];
  vocabulary: VocabItem[];
  grammar: GrammarRule[];
  dialogues: Dialogue[];
  practice: PracticeItem[];
  evaluation: PracticeItem[];
}

export interface ReinforcementPack {
  unitId: number;
  generatedAt: string;
  targets: string[];
  items: PracticeItem[];
}

// =============================================================================
// 5. HISTORIAL Y PROGRESO
// =============================================================================

export interface Attempt {
  id: string;
  itemId: string;
  unitId: number;
  skill: Skill;
  tags: string[];
  userAnswer: string;
  normalizedAnswer: string;
  expectedNormalized: string[];
  correct: boolean;
  errorTag?: string;
  diagnosis?: string;
  timestamp: string;
}

export interface ItemState {
  itemId: string;
  unitId: number;
  status: ItemStatus;
  correctStreak: number;
  ease: number;
  nextReview: string | null;
  lastSeen: string | null;
  totalAttempts: number;
  totalCorrect: number;
}

export interface UnitProgress {
  unitId: number;
  practiceProgress: number;
  evaluationScore: number | null;
  evaluationPassed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface PersistedState {
  schemaVersion: number;
  attempts: Attempt[];
  itemStates: Record<string, ItemState>;
  unitProgress: Record<number, UnitProgress>;
}

// =============================================================================
// 6. EVALUACIÓN
// =============================================================================

export interface SessionResult {
  mode: SessionMode;
  unitId: number;
  total: number;
  correct: number;
  incorrect: number;
  score: number;
  passed?: boolean;
  errorTags: string[];
  startedAt: string;
  finishedAt: string;
}

// =============================================================================
// 7. EXPORTACIÓN
// =============================================================================

export interface ExportPayload {
  meta: {
    exportedAt: string;
    engineVersion: string;
    schemaVersion: number;
    unitsPracticed: number[];
    totalAttempts: number;
    totalCorrect: number;
    totalIncorrect: number;
  };
  errorSummary: Array<{
    tag: string;
    occurrences: number;
    lastSeen: string;
    sampleItems: string[];
  }>;
  recentFailures: Attempt[];
  aiInstructions: string;
}

// =============================================================================
// 8. METADATOS DEL CONTRATO
// =============================================================================

export const CONTRACT_VERSION = "1.1.0" as const;
export const SCHEMA_VERSION = 1 as const;
export const EVALUATION_PASS_THRESHOLD = 70 as const;
export const MASTERY_STREAK = 3 as const;

