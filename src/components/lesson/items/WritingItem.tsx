"use client";

/**
 * Componente para ítems de tipo `writing`.
 * =========================================
 *
 * Producción libre. El motor solo valida longitud mínima; la calidad
 * se evalúa offline vía exportación a IA.
 */

import type { WritingItem as WI } from "@/shared/types";
import type { EvaluationResult } from "@/engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface Props {
  item: WI;
  index: number;
  total: number;
  userAnswer: string;
  onChangeAnswer: (value: string) => void;
  result: EvaluationResult | null;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function WritingItem({
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
  const minLength = item.minLength ?? 5;
  const tooShort = userAnswer.trim().length < minLength;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ejercicio {index + 1} de {total}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Escritura
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{item.prompt}</p>

        {item.model && (
          <div className="rounded-lg bg-muted/50 border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Modelo de referencia:
            </p>
            <pre className="text-sm whitespace-pre-wrap font-sans">
              {item.model}
            </pre>
          </div>
        )}

        <Textarea
          value={userAnswer}
          onChange={(e) => onChangeAnswer(e.target.value)}
          readOnly={result !== null}
          rows={5}
          placeholder="Escribe aquí tu respuesta…"
          className="resize-y"
          aria-label="Tu respuesta escrita"
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {userAnswer.length} caracteres
            {minLength > 0 && tooShort && ` (mínimo ${minLength})`}
          </span>
        </div>

        {item.rubric.length > 0 && result === null && (
          <div className="rounded-lg bg-muted/50 p-3 text-xs">
            <p className="font-medium mb-1">Rúbrica (qué revisar):</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {item.rubric.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

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
              disabled={tooShort}
              className="min-h-[44px]"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Entregar
            </Button>
          ) : (
            <Button onClick={onNext} className="min-h-[44px]">
              {isLast ? "Terminar" : "Siguiente"}
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          )}
        </div>

        {result !== null && (
          <div
            className={`rounded-lg p-3 text-sm border flex items-start gap-2 ${
              result.correct
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {result.correct ? (
              <CheckCircle2 className="size-5 shrink-0" />
            ) : (
              <XCircle className="size-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">
                {result.correct ? "¡Entregado! 🎉" : "Respuesta demasiado corta"}
              </p>
              {result.diagnosis && (
                <p className="mt-1 text-xs">{result.diagnosis}</p>
              )}
              <p className="mt-1 text-xs opacity-80">
                La calidad de la escritura se revisa con IA al exportar el
                historial.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
