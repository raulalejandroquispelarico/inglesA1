"use client";

import { useState } from "react";
import { Exercise } from "@/data/course";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PronounceButton } from "./PronounceButton";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  Volume2,
} from "lucide-react";

interface ExerciseRunnerProps {
  exercise: Exercise;
  index: number;
  total: number;
  /**
   * Si true, muestra corrección visual inmediata (✓/✗ + respuesta correcta).
   * Si false, oculta la retroalimentación visual (modo evaluación).
   * El callback `onAnswer` se invoca SIEMPRE, independientemente de este flag.
   */
  instantFeedback?: boolean;
  onAnswer?: (correct: boolean) => void;
}

type Status = "unanswered" | "correct" | "incorrect";

/**
 * NOTA: El componente padre DEBE pasar `key={exercise.id}` para que el
 * estado interno se reinicie automáticamente al cambiar de ejercicio.
 * Esto evita patrones de "ref-access-during-render".
 */
export function ExerciseRunner({
  exercise,
  index,
  total,
  instantFeedback = true,
  onAnswer,
}: ExerciseRunnerProps) {
  switch (exercise.type) {
    case "match":
      return (
        <MatchExercise
          exercise={exercise}
          index={index}
          total={total}
          instantFeedback={instantFeedback}
          onAnswer={onAnswer}
        />
      );
    case "multiple-choice":
      return (
        <MultipleChoiceExercise
          exercise={exercise}
          index={index}
          total={total}
          instantFeedback={instantFeedback}
          onAnswer={onAnswer}
        />
      );
    case "fill-blank":
      return (
        <FillBlankExercise
          exercise={exercise}
          index={index}
          total={total}
          instantFeedback={instantFeedback}
          onAnswer={onAnswer}
        />
      );
    case "word-order":
      return (
        <WordOrderExercise
          exercise={exercise}
          index={index}
          total={total}
          instantFeedback={instantFeedback}
          onAnswer={onAnswer}
        />
      );
    case "listening":
      return (
        <ListeningExercise
          exercise={exercise}
          index={index}
          total={total}
          instantFeedback={instantFeedback}
          onAnswer={onAnswer}
        />
      );
    case "writing":
      return (
        <WritingExercise
          exercise={exercise}
          index={index}
          total={total}
          onAnswer={onAnswer}
        />
      );
    default:
      return null;
  }
}

/* -------------------- Encabezado común -------------------- */
function ExerciseHeader({
  exercise,
  index,
  total,
}: {
  exercise: Exercise;
  index: number;
  total: number;
}) {
  const typeLabels: Record<Exercise["type"], string> = {
    match: "Emparejar",
    "multiple-choice": "Opción múltiple",
    "fill-blank": "Completar",
    "word-order": "Ordenar palabras",
    listening: "Comprensión auditiva",
    writing: "Escritura",
  };
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          Ejercicio {index + 1} de {total}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {typeLabels[exercise.type]}
        </Badge>
      </div>
      <p className="text-base sm:text-lg font-medium">{exercise.prompt}</p>
    </div>
  );
}

/* -------------------- Retroalimentación común -------------------- */
function Feedback({
  status,
  correctAnswer,
  hint,
}: {
  status: Status;
  correctAnswer?: string;
  hint?: string;
}) {
  if (status === "unanswered") {
    return hint ? (
      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Lightbulb className="size-3.5 shrink-0 mt-0.5" />
        <span>{hint}</span>
      </div>
    ) : null;
  }
  return (
    <div
      className={`mt-4 rounded-lg p-3 text-sm flex items-start gap-2 ${
        status === "correct"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {status === "correct" ? (
        <CheckCircle2 className="size-5 shrink-0" />
      ) : (
        <XCircle className="size-5 shrink-0" />
      )}
      <div>
        <p className="font-medium">
          {status === "correct" ? "¡Correcto! 🎉" : "Respuesta incorrecta"}
        </p>
        {status === "incorrect" && correctAnswer && (
          <p className="mt-0.5">
            Respuesta correcta: <strong>{correctAnswer}</strong>
          </p>
        )}
        {hint && <p className="mt-1 text-xs opacity-80">{hint}</p>}
      </div>
    </div>
  );
}

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, " ");
}

/* -------------------- Emparejar -------------------- */
function MatchExercise({
  exercise,
  index,
  total,
  instantFeedback,
  onAnswer,
}: ExerciseRunnerProps) {
  const pairs = exercise.pairs ?? [];
  // Opciones derecha barajadas (estables gracias a `key` en el padre)
  const [rightOptions] = useState(() =>
    shuffle(pairs.map((p) => p.right))
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("unanswered");

  const handleRightClick = (right: string) => {
    if (!selectedLeft || status !== "unanswered") return;
    const newMatches = { ...matches, [selectedLeft]: right };
    setMatches(newMatches);
    setSelectedLeft(null);

    // ¿Todas emparejadas?
    if (Object.keys(newMatches).length === pairs.length) {
      const allCorrect = pairs.every(
        (p) => newMatches[p.left] === p.right
      );
      setStatus(allCorrect ? "correct" : "incorrect");
      onAnswer?.(allCorrect);
    }
  };

  const reset = () => {
    setSelectedLeft(null);
    setMatches({});
    setStatus("unanswered");
  };

  const leftForRight = (right: string): string | undefined =>
    Object.entries(matches).find(([, r]) => r === right)?.[0];

  return (
    <Card>
      <CardContent className="pt-6">
        <ExerciseHeader exercise={exercise} index={index} total={total} />
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Columna izquierda */}
          <div className="space-y-2">
            {pairs.map((p) => {
              const matched = matches[p.left];
              const isCorrectMatch = matched === p.right;
              return (
                <button
                  key={p.left}
                  type="button"
                  disabled={!!matched}
                  onClick={() =>
                    status === "unanswered" && setSelectedLeft(p.left)
                  }
                  className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm sm:text-base min-h-[44px] ${
                    matched
                      ? isCorrectMatch
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-red-400 bg-red-50 text-red-700"
                      : selectedLeft === p.left
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  {p.left}
                  {matched && (
                    <span className="block text-xs mt-0.5 opacity-80">
                      → {matched}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Columna derecha (barajada) */}
          <div className="space-y-2">
            {rightOptions.map((right) => {
              const matchedTo = leftForRight(right);
              return (
                <button
                  key={right}
                  type="button"
                  disabled={!!matchedTo}
                  onClick={() => handleRightClick(right)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm sm:text-base min-h-[44px] ${
                    matchedTo
                      ? "border-muted bg-muted text-muted-foreground opacity-60"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  {right}
                </button>
              );
            })}
          </div>
        </div>

        {instantFeedback && (
          <Feedback status={status} hint={status === "unanswered" ? exercise.hint : undefined} />
        )}

        {status !== "unanswered" && (
          <Button variant="ghost" size="sm" onClick={reset} className="mt-3">
            <RotateCcw className="size-3.5 mr-1.5" />
            Intentar de nuevo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- Opción múltiple -------------------- */
function MultipleChoiceExercise({
  exercise,
  index,
  total,
  instantFeedback,
  onAnswer,
}: ExerciseRunnerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("unanswered");

  const handleSelect = (option: string) => {
    if (status !== "unanswered") return;
    setSelected(option);
    const correct = option === exercise.answer;
    setStatus(correct ? "correct" : "incorrect");
    onAnswer?.(correct);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ExerciseHeader exercise={exercise} index={index} total={total} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {exercise.options?.map((opt) => {
            const isSelected = selected === opt;
            const isAnswer = opt === exercise.answer;
            const showCorrect = status !== "unanswered" && isAnswer;
            const showIncorrect = status === "incorrect" && isSelected;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                disabled={status !== "unanswered"}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm sm:text-base font-medium min-h-[44px] ${
                  showCorrect
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : showIncorrect
                      ? "border-red-400 bg-red-50 text-red-700"
                      : isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {instantFeedback && (
          <Feedback
            status={status}
            correctAnswer={Array.isArray(exercise.answer) ? exercise.answer.join(" / ") : exercise.answer}
            hint={status === "unanswered" ? exercise.hint : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- Completar huecos -------------------- */
function FillBlankExercise({
  exercise,
  index,
  total,
  instantFeedback,
  onAnswer,
}: ExerciseRunnerProps) {
  const blanks = exercise.blanks ?? [];
  const [values, setValues] = useState<string[]>(() => blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<Status>("unanswered");

  const handleCheck = () => {
    const allCorrect = blanks.every((b, i) => {
      const userVal = normalize(values[i] ?? "");
      const answers = Array.isArray(b.answer) ? b.answer : [b.answer];
      const acceptable = [...answers, ...(b.acceptableAnswers ?? [])].map(normalize);
      return acceptable.includes(userVal);
    });
    setChecked(true);
    setStatus(allCorrect ? "correct" : "incorrect");
    onAnswer?.(allCorrect);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ExerciseHeader exercise={exercise} index={index} total={total} />
        <div className="space-y-4">
          {blanks.map((blank, i) => {
            const isCorrect = checked && (() => {
              const userVal = normalize(values[i] ?? "");
              const answers = Array.isArray(blank.answer) ? blank.answer : [blank.answer];
              const acceptable = [...answers, ...(blank.acceptableAnswers ?? [])].map(normalize);
              return acceptable.includes(userVal);
            })();
            const isIncorrect = checked && !isCorrect;
            return (
              <div key={i} className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                <span>{blank.before}</span>
                <Input
                  value={values[i]}
                  onChange={(e) => {
                    const next = [...values];
                    next[i] = e.target.value;
                    setValues(next);
                  }}
                  disabled={checked && status !== "unanswered"}
                  className={`w-24 sm:w-32 inline-flex h-10 ${
                    isCorrect
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : isIncorrect
                        ? "border-red-400 bg-red-50 text-red-700"
                        : ""
                  }`}
                  placeholder="..."
                  aria-label={`Respuesta ${i + 1}`}
                />
                <span>{blank.after}</span>
              </div>
            );
          })}
        </div>

        {status === "unanswered" && (
          <Button onClick={handleCheck} size="sm" className="mt-4" disabled={values.some((v) => !v.trim())}>
            <CheckCircle2 className="size-4 mr-1.5" />
            Comprobar
          </Button>
        )}

        {instantFeedback && (
          <Feedback
            status={status}
            correctAnswer={checked ? blanks.map((b) => b.answer).join(" / ") : undefined}
            hint={status === "unanswered" ? exercise.hint : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- Ordenar palabras -------------------- */
function WordOrderExercise({
  exercise,
  index,
  total,
  instantFeedback,
  onAnswer,
}: ExerciseRunnerProps) {
  const words = exercise.words ?? [];
  const [shuffled] = useState(() => shuffle(words));
  const [selected, setSelected] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>("unanswered");

  const handleWordClick = (word: string, idx: number) => {
    if (status !== "unanswered") return;
    if (usedIndices.includes(idx)) return;
    setSelected([...selected, word]);
    setUsedIndices([...usedIndices, idx]);
  };

  const handleSelectedClick = (i: number) => {
    if (status !== "unanswered") return;
    const newSelected = selected.filter((_, j) => j !== i);
    setSelected(newSelected);
    setUsedIndices(usedIndices.filter((_, j) => j !== i));
  };

  const handleCheck = () => {
    const built = selected.join(" ").trim();
    const userVal = normalize(built);
    const answers = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer ?? ""];
    const acceptable = [...answers, ...(exercise.acceptableAnswers ?? [])].map(normalize);
    const correct = acceptable.includes(userVal);
    setStatus(correct ? "correct" : "incorrect");
    onAnswer?.(correct);
  };

  const reset = () => {
    setSelected([]);
    setUsedIndices([]);
    setStatus("unanswered");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ExerciseHeader exercise={exercise} index={index} total={total} />

        {/* Frase construida */}
        <div className="min-h-[64px] rounded-lg border-2 border-dashed border-border p-3 mb-4 flex flex-wrap gap-2 items-center">
          {selected.length === 0 && (
            <span className="text-sm text-muted-foreground italic">
              Toca las palabras abajo para construir la frase…
            </span>
          )}
          {selected.map((word, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectedClick(i)}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 min-h-[36px]"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Palabras disponibles */}
        <div className="flex flex-wrap gap-2">
          {shuffled.map((word, idx) => {
            const used = usedIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                disabled={used || status !== "unanswered"}
                onClick={() => handleWordClick(word, idx)}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium min-h-[36px] transition-all ${
                  used
                    ? "opacity-30 border-muted bg-muted"
                    : "border-border hover:border-primary/50 hover:bg-muted/50 bg-card"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>

        {status === "unanswered" && selected.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleCheck} size="sm" disabled={selected.length !== words.length}>
              <CheckCircle2 className="size-4 mr-1.5" />
              Comprobar
            </Button>
            <Button onClick={reset} variant="ghost" size="sm">
              <RotateCcw className="size-3.5 mr-1.5" />
              Reiniciar
            </Button>
          </div>
        )}

        {instantFeedback && (
          <Feedback
            status={status}
            correctAnswer={Array.isArray(exercise.answer) ? exercise.answer.join(" / ") : exercise.answer}
            hint={status === "unanswered" ? exercise.hint : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- Comprensión auditiva -------------------- */
function ListeningExercise({
  exercise,
  index,
  total,
  instantFeedback,
  onAnswer,
}: ExerciseRunnerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("unanswered");

  const handleSelect = (choice: string) => {
    if (status !== "unanswered") return;
    setSelected(choice);
    const correct = choice === exercise.answer;
    setStatus(correct ? "correct" : "incorrect");
    onAnswer?.(correct);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ExerciseHeader exercise={exercise} index={index} total={total} />

        <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shrink-0">
            <Volume2 className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">
              Toca para escuchar (puedes repetir las veces que necesites)
            </p>
            <PronounceButton
              text={exercise.audioText ?? ""}
              label="Escuchar audio"
              variant="default"
              size="sm"
            />
          </div>
        </div>

        {exercise.question && (
          <p className="text-sm font-medium mb-3">{exercise.question}</p>
        )}

        <div className="grid grid-cols-1 gap-2">
          {exercise.choices?.map((choice) => {
            const isSelected = selected === choice;
            const isAnswer = choice === exercise.answer;
            return (
              <button
                key={choice}
                type="button"
                onClick={() => handleSelect(choice)}
                disabled={status !== "unanswered"}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-left text-sm sm:text-base min-h-[44px] ${
                  status !== "unanswered" && isAnswer
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : status === "incorrect" && isSelected
                      ? "border-red-400 bg-red-50 text-red-700"
                      : isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {instantFeedback && (
          <Feedback
            status={status}
            correctAnswer={Array.isArray(exercise.answer) ? exercise.answer.join(" / ") : exercise.answer}
            hint={status === "unanswered" ? exercise.hint : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- Escritura libre -------------------- */
function WritingExercise({
  exercise,
  index,
  total,
  onAnswer,
}: ExerciseRunnerProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    // La escritura libre siempre se considera "completada" si hay texto
    onAnswer?.(text.trim().length >= 10);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ExerciseHeader exercise={exercise} index={index} total={total} />

        {exercise.model && (
          <div className="mb-3 p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Modelo de referencia:
            </p>
            <pre className="text-sm whitespace-pre-wrap font-sans">
              {exercise.model}
            </pre>
          </div>
        )}

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          disabled={submitted}
          placeholder="Escribe aquí tu respuesta…"
          className="resize-y"
          aria-label="Tu respuesta"
        />

        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {text.length} caracteres
          </span>
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              size="sm"
              disabled={text.trim().length < 5}
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Entregar respuesta
            </Button>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <CheckCircle2 className="size-3.5 mr-1.5" />
              Respuesta registrada
            </Badge>
          )}
        </div>

        {submitted && (
          <div className="mt-3 rounded-lg p-3 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="size-5 shrink-0" />
            <div>
              <p className="font-medium">¡Bien hecho! 🎉</p>
              <p className="mt-0.5 text-xs">
                La escritura libre se revisa subjetivamente. Compara tu
                respuesta con el modelo y pide feedback a tu profesor/a si
                tienes dudas.
              </p>
            </div>
          </div>
        )}

        {exercise.hint && !submitted && (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Lightbulb className="size-3.5 shrink-0 mt-0.5" />
            <span>{exercise.hint}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------- Utilidades -------------------- */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
