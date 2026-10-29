"use client";

/**
 * Componente para ítems de tipo `reading`.
 * ========================================
 *
 * El alumno lee un texto corto y responde una pregunta de comprensión
 * eligiendo una opción.
 *
 * `userAnswer` es el string de la opción elegida.
 */

import type { ReadingItem as RI } from "@/shared/types";
import type { EvaluationResult } from "@/engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface Props {
  item: RI;
  index: number;
  total: number;
  userAnswer: string;
  onChangeAnswer: (value: string) => void;
  result: EvaluationResult | null;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function ReadingItem({
  item,
  index,
  total,
  userAnswer,
  onChangeAnswer,
  result,
  onCheck,
  onNext,
  isLast,
}: Props) {
  const selected = userAnswer || null;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ejercicio {index + 1} de {total}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Comprensión lectora
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{item.prompt}</p>

        {/* Texto a leer */}
        <div className="rounded-lg border-2 border-border bg-muted/30 p-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {item.sourceText}
          </p>
        </div>

        <p className="text-sm font-medium">{item.question}</p>

        {/* Opciones */}
        <div className="grid grid-cols-1 gap-2">
          {item.choices.map((c) => {
            const isSelected = selected === c;
            const isAnswer = item.expected.includes(c);
            const showCorrect = result !== null && isAnswer;
            const showIncorrect =
              result !== null && isSelected && !result.correct;
            return (
              <button
                key={c}
                type="button"
                onClick={() => result === null && onChangeAnswer(c)}
                disabled={result !== null}
                className={`px-4 py-3 rounded-lg border-2 text-left text-sm min-h-[44px] transition-all ${
                  showCorrect
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : showIncorrect
                      ? "border-red-400 bg-red-50 text-red-700"
                      : isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {result === null && item.hint && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lightbulb className="size-3.5 shrink-0 mt-0.5" />
            <span>{item.hint}</span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {result === null ? (
            <Button
              onClick={onCheck}
              disabled={!selected}
              className="min-h-[44px]"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Comprobar
            </Button>
          ) : (
            <Button onClick={onNext} className="min-h-[44px]">
              {isLast ? "Terminar" : "Siguiente"}
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          )}
        </div>

        {result !== null && <Feedback result={result} />}
      </CardContent>
    </Card>
  );
}

function Feedback({ result }: { result: EvaluationResult }) {
  if (result.correct) {
    return (
      <div className="rounded-lg p-3 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-start gap-2">
        <CheckCircle2 className="size-5 shrink-0" />
        <p className="font-medium">¡Correcto! 🎉</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
      <XCircle className="size-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Respuesta incorrecta</p>
        {result.diagnosis && (
          <p className="mt-1 text-xs">{result.diagnosis}</p>
        )}
      </div>
    </div>
  );
}
