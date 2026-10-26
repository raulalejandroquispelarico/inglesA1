"use client";

/**
 * Componente que renderiza un ítem de tipo `translation`.
 * =======================================================
 *
 * Recibe el ítem y una respuesta controlada por el padre (PracticeRunner).
 * No evalúa: solo muestra y notifica cambios de texto. La evaluación la
 * hace el padre con `evaluate()` del motor.
 */

import { useRef } from "react";
import type { TranslationItem as TranslationItemType } from "@/shared/types";
import type { EvaluationResult } from "@/engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Volume2,
  ArrowRight,
} from "lucide-react";
import { speakEnglish } from "@/lib/speech-practice";

interface TranslationItemProps {
  item: TranslationItemType;
  index: number;
  total: number;
  userAnswer: string;
  onChangeAnswer: (value: string) => void;
  result: EvaluationResult | null;
  onCheck: () => void;
  onNext: () => void;
  isLast: boolean;
}

export function TranslationItem({
  item,
  index,
  total,
  userAnswer,
  onChangeAnswer,
  result,
  onCheck,
  onNext,
  isLast,
}: TranslationItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (result === null) {
        onCheck();
      } else {
        onNext();
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Cabecera */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ejercicio {index + 1} de {total}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Traducción
          </Badge>
        </div>

        {/* Prompt */}
        <p className="text-sm text-muted-foreground">{item.prompt}</p>

        {/* Estímulo */}
        <div className="rounded-lg border-2 border-border bg-muted/30 p-4">
          <p className="text-base sm:text-lg font-medium">
            {item.sourceText}
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Input
            ref={inputRef}
            value={userAnswer}
            onChange={(e) => onChangeAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={result !== null}
            placeholder="Escribe la traducción en inglés…"
            className="h-12 text-base"
            aria-label="Tu respuesta en inglés"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          {result === null && item.hint && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Lightbulb className="size-3.5 shrink-0 mt-0.5" />
              <span>{item.hint}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 flex-wrap">
          {result === null ? (
            <Button
              onClick={onCheck}
              disabled={userAnswer.trim().length === 0}
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

        {/* Feedback */}
        {result !== null && (
          <FeedbackBlock result={result} item={item} />
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackBlock({
  result,
  item,
}: {
  result: EvaluationResult;
  item: TranslationItemType;
}) {
  if (result.correct) {
    return (
      <div className="rounded-lg p-3 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-start gap-2">
        <CheckCircle2 className="size-5 shrink-0" />
        <div>
          <p className="font-medium">¡Correcto! 🎉</p>
          {result.matchedExpected && (
            <p className="mt-0.5">
              Respuesta: <strong>{result.matchedExpected}</strong>
            </p>
          )}
          {item.explanation && (
            <p className="mt-1 text-xs opacity-80">{item.explanation}</p>
          )}
        </div>
      </div>
    );
  }

  // Incorrecto
  return (
    <div className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
      <XCircle className="size-5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Respuesta incorrecta</p>

        {result.diagnosis ? (
          <div className="mt-1.5">
            <p>
              <strong>¿Qué falló?</strong> {result.diagnosis}
            </p>
            {result.rule && (
              <p className="mt-1">
                <strong>Regla:</strong> {result.rule}
              </p>
            )}
            {result.example && (
              <p className="mt-1 text-xs opacity-80">
                Ejemplo: <em>{result.example}</em>
              </p>
            )}
          </div>
        ) : (
          <p className="mt-1">
            Revisa tu respuesta. La correcta es:{" "}
            <strong>{item.expected[0]}</strong>
          </p>
        )}

        {result.similarity > 0.5 && result.similarity < 1 && (
          <p className="mt-1.5 text-xs opacity-80">
            Tu respuesta se parece al{" "}
            {Math.round(result.similarity * 100)}% a la correcta. Revisa si
            te falta una palabra.
          </p>
        )}

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => speakEnglish(item.expected[0] ?? "")}
            className="text-xs"
          >
            <Volume2 className="size-3.5 mr-1" />
            Escuchar correcta
          </Button>
        </div>
      </div>
    </div>
  );
}
