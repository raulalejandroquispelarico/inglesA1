"use client";

/**
 * Componente que renderiza un ítem de tipo `match`.
 * =================================================
 *
 * El usuario empareja columnas. Al hacer click en una izquierda y luego
 * en una derecha, se fija la pareja. Cuando todas las izquierdas tienen
 * pareja, se puede comprobar.
 *
 * La respuesta se serializa como JSON: { "left": "right", ... }
 * y se pasa al padre vía onChangeAnswer().
 */

import { useMemo, useState } from "react";
import type { MatchItem as MatchItemType } from "@/shared/types";
import type { EvaluationResult } from "@/engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface MatchItemProps {
  item: MatchItemType;
  index: number;
  total: number;
  userAnswer: string;
  onChangeAnswer: (value: string) => void;
  result: EvaluationResult | null;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

function parseAnswer(raw: string): Record<string, string> {
  try {
    const p: unknown = JSON.parse(raw);
    if (typeof p === "object" && p !== null && !Array.isArray(p)) {
      return p as Record<string, string>;
    }
  } catch {
    /* vacío */
  }
  return {};
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchItem({
  item,
  index,
  total,
  userAnswer,
  onChangeAnswer,
  result,
  onCheck,
  onNext,
  isLast,
}: MatchItemProps) {
  const matches = useMemo(() => parseAnswer(userAnswer), [userAnswer]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Barajar la columna derecha una sola vez por ítem (useMemo con dep [item.id]).
  const rightOptions = useMemo(
    () => shuffle(item.pairs.map((p) => p.right)),
    [item.pairs],
  );

  const leftForRight = (right: string): string | undefined =>
    Object.entries(matches).find(([, r]) => r === right)?.[0];

  const handleLeftClick = (left: string) => {
    if (result !== null) return;
    if (matches[left]) return; // ya emparejada
    setSelectedLeft(left);
  };

  const handleRightClick = (right: string) => {
    if (result !== null) return;
    if (!selectedLeft) return;
    if (leftForRight(right)) return; // ya usada
    const next = { ...matches, [selectedLeft]: right };
    onChangeAnswer(JSON.stringify(next));
    setSelectedLeft(null);
  };

  const handleReset = () => {
    if (result !== null) return;
    onChangeAnswer("{}");
    setSelectedLeft(null);
  };

  const allMatched = Object.keys(matches).length === item.pairs.length;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ejercicio {index + 1} de {total}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Emparejar
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{item.prompt}</p>

        <div className="grid grid-cols-2 gap-3">
          {/* Izquierda */}
          <div className="space-y-2">
            {item.pairs.map((p) => {
              const matched = matches[p.left];
              const isCorrect = matched === p.right;
              const showState = result !== null && matched;
              return (
                <button
                  key={p.left}
                  type="button"
                  disabled={!!matched || result !== null}
                  onClick={() => handleLeftClick(p.left)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm min-h-[44px] transition-all ${
                    showState
                      ? isCorrect
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-red-400 bg-red-50 text-red-700"
                      : matched
                        ? "border-primary/50 bg-primary/10"
                        : selectedLeft === p.left
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
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

          {/* Derecha */}
          <div className="space-y-2">
            {rightOptions.map((right) => {
              const usedBy = leftForRight(right);
              return (
                <button
                  key={right}
                  type="button"
                  disabled={!!usedBy || result !== null}
                  onClick={() => handleRightClick(right)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm min-h-[44px] transition-all ${
                    usedBy
                      ? "border-muted bg-muted text-muted-foreground opacity-60"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {right}
                </button>
              );
            })}
          </div>
        </div>

        {result === null && item.hint && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lightbulb className="size-3.5 shrink-0 mt-0.5" />
            <span>{item.hint}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {result === null ? (
              <>
                <Button
                  onClick={onCheck}
                  disabled={!allMatched}
                  className="min-h-[44px]"
                >
                  <CheckCircle2 className="size-4 mr-1.5" />
                  Comprobar
                </Button>
                {Object.keys(matches).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="min-h-[44px]"
                  >
                    <RotateCcw className="size-3.5 mr-1.5" />
                    Reiniciar
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={onNext} className="min-h-[44px]">
                {isLast ? "Terminar" : "Siguiente"}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}
          </div>
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
        <p className="font-medium">¡Todas las parejas correctas! 🎉</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
      <XCircle className="size-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Algunas parejas son incorrectas</p>
        {result.diagnosis && (
          <p className="mt-1 text-xs">
            {result.diagnosis}
          </p>
        )}
      </div>
    </div>
  );
}
