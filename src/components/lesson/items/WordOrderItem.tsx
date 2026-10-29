"use client";

/**
 * Componente para ítems de tipo `word-order`.
 * ============================================
 *
 * El usuario toca palabras para construir la frase. `userAnswer` es la
 * frase construida (string).
 */

import { useMemo, useState } from "react";
import type { WordOrderItem as WOI } from "@/shared/types";
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

interface Props {
  item: WOI;
  index: number;
  total: number;
  userAnswer: string;
  onChangeAnswer: (value: string) => void;
  result: EvaluationResult | null;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function WordOrderItem({
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
  // Barajar una sola vez por ítem.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const shuffled = useMemo(() => shuffle(item.words), [item.id]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const selectedWords = selectedIndices.map((i) => shuffled[i]);

  const handleWordClick = (idx: number) => {
    if (result !== null) return;
    if (selectedIndices.includes(idx)) return;
    const next = [...selectedIndices, idx];
    setSelectedIndices(next);
    onChangeAnswer(next.map((i) => shuffled[i]).join(" "));
  };

  const handleSelectedClick = (pos: number) => {
    if (result !== null) return;
    const next = selectedIndices.filter((_, j) => j !== pos);
    setSelectedIndices(next);
    onChangeAnswer(next.map((i) => shuffled[i]).join(" "));
  };

  const handleReset = () => {
    if (result !== null) return;
    setSelectedIndices([]);
    onChangeAnswer("");
  };

  const canCheck = selectedIndices.length === shuffled.length;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ejercicio {index + 1} de {total}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Ordenar palabras
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{item.prompt}</p>

        {/* Zona de construcción */}
        <div className="min-h-[64px] rounded-lg border-2 border-dashed border-border p-3 flex flex-wrap gap-2 items-center">
          {selectedWords.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              Toca las palabras de abajo para construir la frase.
            </span>
          )}
          {selectedWords.map((w, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectedClick(i)}
              disabled={result !== null}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium min-h-[36px]"
            >
              {w}
            </button>
          ))}
        </div>

        {/* Palabras disponibles */}
        <div className="flex flex-wrap gap-2">
          {shuffled.map((w, idx) => {
            const used = selectedIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                disabled={used || result !== null}
                onClick={() => handleWordClick(idx)}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium min-h-[36px] transition-all ${
                  used
                    ? "opacity-30 border-muted bg-muted"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                {w}
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
            <>
              <Button
                onClick={onCheck}
                disabled={!canCheck}
                className="min-h-[44px]"
              >
                <CheckCircle2 className="size-4 mr-1.5" />
                Comprobar
              </Button>
              {selectedIndices.length > 0 && (
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
  item: WOI;
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
        <p className="font-medium">Orden incorrecto</p>
        <p className="mt-1 text-xs">
          Frase correcta: <strong>{item.expected[0]}</strong>
        </p>
      </div>
    </div>
  );
}
