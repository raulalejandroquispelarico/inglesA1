"use client";

/**
 * Orquestador de una sesión de práctica.
 * =======================================
 *
 * v4a: ahora despacha a los 7 componentes de ítem por kind.
 * v4a-fix: añadido key={item.id} para forzar re-montaje.
 */

import { usePracticeSession } from "@/hooks/use-practice-session";
import { TranslationItem } from "./items/TranslationItem";
import { MatchItem } from "./items/MatchItem";
import { MultipleChoiceItem } from "./items/MultipleChoiceItem";
import { FillBlankItem } from "./items/FillBlankItem";
import { WordOrderItem } from "./items/WordOrderItem";
import { ListeningItem } from "./items/ListeningItem";
import { WritingItem } from "./items/WritingItem";
import { ReadingItem } from "./items/ReadingItem";
import type { Unit } from "@/shared/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface PracticeRunnerProps {
  unit: Unit;
}

export function PracticeRunner({ unit }: PracticeRunnerProps) {
  const session = usePracticeSession({ unit, mode: "full" });

  if (session.total === 0 && !session.finished) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          Cargando…
        </CardContent>
      </Card>
    );
  }

  if (session.finished) {
    const total = session.sessionCorrect + session.sessionIncorrect;
    const pct =
      total > 0 ? Math.round((session.sessionCorrect / total) * 100) : 0;
    return (
      <Card>
        <CardContent className="pt-6 space-y-4 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-semibold">Sesión terminada</h2>
          <p className="text-sm text-muted-foreground">
            {session.sessionCorrect} correctas · {session.sessionIncorrect}{" "}
            incorrectas
          </p>
          <p className="text-lg font-medium">{pct}% de aciertos</p>
          <div className="flex gap-2 justify-center pt-2">
            <Button onClick={session.restart}>
              <RotateCcw className="size-4 mr-1.5" />
              Repetir solo falladas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session.currentItem) return null;

  const { item } = session.currentItem;
  const progressPct =
    session.total > 0
      ? Math.round((session.index / session.total) * 100)
      : 0;

  const commonProps = {
    key: item.id,
    index: session.index,
    total: session.total,
    userAnswer: session.answer,
    onChangeAnswer: session.setAnswer,
    result: session.result,
    onCheck: session.check,
    onNext: session.next,
    isLast: session.index + 1 === session.total,
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {session.index + 1} / {session.total}
          </span>
          <span>
            <CheckCircle2 className="size-3.5 inline mr-1 text-emerald-600" />
            {session.sessionCorrect} correctas
          </span>
        </div>
        <Progress value={progressPct} />
      </div>

      {item.kind === "translation" && (
        <TranslationItem item={item} {...commonProps} />
      )}
      {item.kind === "match" && <MatchItem item={item} {...commonProps} />}
      {item.kind === "multiple-choice" && (
        <MultipleChoiceItem item={item} {...commonProps} />
      )}
      {item.kind === "fill-blank" && (
        <FillBlankItem item={item} {...commonProps} />
      )}
      {item.kind === "word-order" && (
        <WordOrderItem item={item} {...commonProps} />
      )}
      {item.kind === "listening" && (
        <ListeningItem item={item} {...commonProps} />
      )}
      {item.kind === "writing" && (
        <WritingItem item={item} {...commonProps} />
      )}
      {item.kind === "reading" && (
        <ReadingItem item={item} {...commonProps} />
      )}
    </div>
  );
}
