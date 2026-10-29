"use client";

/**
 * Componente para ítems de tipo `fill-blank`.
 * =============================================
 *
 * El usuario completa varios huecos. `userAnswer` es un JSON array de
 * strings, uno por hueco. Ej: '["is","are"]'.
 */

import { useMemo } from "react";
import type { FillBlankItem as FBI } from "@/shared/types";
import type { EvaluationResult } from "@/engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface Props {
  item: FBI;
  index: number;
  total: number;
  userAnswer: string;
  onChangeAnswer: (value: string) => void;
  result: EvaluationResult | null;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

function parseValues(raw: string, count: number): string[] {
  try {
    const p: unknown = JSON.parse(raw);
    if (Array.isArray(p) && p.every((x) => typeof x === "string")) {
      const arr = p as string[];
      while (arr.length < count) arr.push("");
      return arr.slice(0, count);
    }
  } catch {
    /* vacío */
  }
  return new Array(count).fill("");
}

export function FillBlankItem({
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
  const values = useMemo(
    () => parseValues(userAnswer, item.blanks.length),
    [userAnswer, item.blanks.length],
  );

  const handleChange = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    onChangeAnswer(JSON.stringify(next));
  };

  const allFilled = values.every((v) => v.trim().length > 0);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ejercicio {index + 1} de {total}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Completar
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{item.prompt}</p>

        <div className="space-y-3">
          {item.blanks.map((blank, i) => {
            const v = values[i] ?? "";
            const isAnswerCorrect =
              result !== null &&
              blank.expected.some(
                (e) => e.toLowerCase().trim() === v.toLowerCase().trim(),
              );
            return (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                {blank.before && <span>{blank.before}</span>}
                <Input
                  value={v}
                  onChange={(e) => handleChange(i, e.target.value)}
                  readOnly={result !== null}
                  placeholder="…"
                  className={`w-28 inline-flex h-10 ${
                    result !== null
                      ? isAnswerCorrect
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-red-400 bg-red-50"
                      : ""
                  }`}
                  aria-label={`Respuesta ${i + 1}`}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                {blank.after && <span>{blank.after}</span>}
              </div>
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
              disabled={!allFilled}
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

        {result !== null && <Feedback result={result} item={item} />}
      </CardContent>
    </Card>
  );
}

function Feedback({
  result,
  item,
}: {
  result: EvaluationResult;
  item: FBI;
}) {
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
        <p className="mt-1 text-xs">
          Respuestas correctas:{" "}
          {item.blanks.map((b) => b.expected[0]).join(" / ")}
        </p>
      </div>
    </div>
  );
}
