"use client";

/**
 * Orquestador de una sesión de práctica.
 * =======================================
 *
 * Consume el hook usePracticeSession y renderiza el ítem actual
 * usando el componente correspondiente a su `kind`.
 *
 * En esta tanda solo soporta `translation`. Los demás tipos se
 * agregan en Tanda 4.
 */

import { usePracticeSession } from "@/hooks/use-practice-session";
import { TranslationItem } from "./items/TranslationItem";
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

  // Cargando estado inicial (SSR / primer render).
  if (session.total === 0 && !session.finished) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          Cargando…
        </CardContent>
      </Card>
    );
  }

  // Sesión terminada.
  if (session.finished) {
    const total = session.sessionCorrect + session.sessionIncorrect;
    const pct = total > 0 ? Math.round((session.sessionCorrect / total) * 100) : 0;
    return (
      <Card>
        <CardContent className="pt-6 space-y-4 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-semibold">Sesión terminada</h2>
          <p className="text-sm text-muted-foreground">
            {session.sessionCorrect} correctas · {session.sessionIncorrect} incorrectas
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

  // Sin ítem actual (raro, pero posible).
  if (!session.currentItem) {
    return null;
  }

  const { item } = session.currentItem;
  const progressPct =
    session.total > 0 ? Math.round((session.index / session.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Barra de progreso */}
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

      {/* Renderizar según kind */}
      {item.kind === "translation" && (
        <TranslationItem
          item={item}
          index={session.index}
          total={session.total}
          userAnswer={session.answer}
          onChangeAnswer={session.setAnswer}
          result={session.result}
          onCheck={session.check}
          onNext={session.next}
          isLast={session.index + 1 === session.total}
        />
      )}

      {item.kind !== "translation" && (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            Tipo &quot;{item.kind}&quot; aún no soportado en el piloto.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
