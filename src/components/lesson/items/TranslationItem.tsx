"use client";

/**
 * Componente que renderiza un ítem de tipo `translation`.
 * =======================================================
 *
 * v3.2:
 *  - Botón de audio movido arriba de la caja del estímulo (alineado a
 *    la derecha, junto al prompt).
 *  - Botón de audio es toggle de mute persistente (verde / rojo tachado).
 *  - Al comprobar: si el audio está activo, se reproduce la respuesta
 *    correcta automáticamente.
 *  - Porcentaje de similitud como círculo semáforo al lado del botón
 *    "Comprobar"/"Siguiente".
 *  - Cuadro de feedback limpio: sin % ni botón de audio dentro.
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
  VolumeX,
  ArrowRight,
} from "lucide-react";
import { speakEnglish } from "@/lib/speech-practice";
import { useAudioPreference } from "@/hooks/use-audio-preference";

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
  const { audioEnabled, toggle } = useAudioPreference();

  const correctText = item.expected[0] ?? item.sourceText;

  const handleCheck = () => {
    onCheck();
    // El audio se dispara desde el padre (PracticeRunner) tras evaluar,
    // o aquí si el padre ya nos pasó el resultado. Como no lo tenemos
    // aún, disparamos un setTimeout(0) que espera al re-render.
    // Alternativa más limpia: el padre dispara el audio cuando el
    // result cambia. Lo hacemos aquí por simplicidad.
    if (audioEnabled) {
      setTimeout(() => speakEnglish(correctText), 50);
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (result === null) {
        if (userAnswer.trim().length > 0) handleCheck();
      } else {
        handleNext();
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Cabecera: badges + prompt + botón audio (fila superior) */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Ejercicio {index + 1} de {total}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Traducción
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{item.prompt}</p>
          <AudioToggle enabled={audioEnabled} onToggle={toggle} />
        </div>

        {/* Estímulo (sin botón de audio dentro) */}
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
            readOnly={result !== null}
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

        {/* Acciones + similitud */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 flex-wrap">
            {result === null ? (
              <Button
                onClick={handleCheck}
                disabled={userAnswer.trim().length === 0}
                className="min-h-[44px]"
              >
                <CheckCircle2 className="size-4 mr-1.5" />
                Comprobar
              </Button>
            ) : (
              <Button onClick={handleNext} className="min-h-[44px]">
                {isLast ? "Terminar" : "Siguiente"}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}
          </div>

          {result !== null && (
            <SimilarityCircle score={result.similarity} />
          )}
        </div>

        {/* Feedback (limpio: sin % ni botón de audio) */}
        {result !== null && <FeedbackBlock result={result} item={item} />}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-componentes                                                            */
/* -------------------------------------------------------------------------- */

function AudioToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={enabled ? "Silenciar audio" : "Activar audio"}
      title={enabled ? "Silenciar audio" : "Activar audio"}
      className={`shrink-0 inline-flex items-center justify-center size-11 rounded-full border-2 transition-colors ${
        enabled
          ? "border-emerald-500 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          : "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
      }`}
    >
      {enabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  );
}

function SimilarityCircle({ score }: { score: number }) {
  // score: 0..1
  if (score <= 0) {
    return (
      <div
        className="shrink-0 inline-flex items-center justify-center size-11 rounded-full bg-muted text-muted-foreground text-xs font-bold"
        title="Sin datos de similitud"
      >
        —
      </div>
    );
  }

  const pct = Math.round(score * 100);
  let cls = "bg-red-500 text-white";
  if (score >= 0.9) cls = "bg-emerald-500 text-white";
  else if (score >= 0.6) cls = "bg-amber-500 text-white";

  return (
    <div
      className={`shrink-0 inline-flex items-center justify-center size-11 rounded-full text-xs font-bold ${cls}`}
      title={`Similitud con la respuesta correcta: ${pct}%`}
    >
      {pct}%
    </div>
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
        <div className="flex-1">
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

  return (
    <div className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
      <XCircle className="size-5 shrink-0 mt-0.5" />
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
      </div>
    </div>
  );
}
