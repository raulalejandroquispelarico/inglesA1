"use client";

import { useState } from "react";
import { Exercise } from "@/data/course";
import { ExerciseRunner } from "./ExerciseRunner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

interface ExercisesTabProps {
  exercises: Exercise[];
}

export function ExercisesTab({ exercises }: ExercisesTabProps) {
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<boolean[]>(() =>
    exercises.map(() => false)
  );
  const [answered, setAnswered] = useState<boolean[]>(() =>
    exercises.map(() => false)
  );

  const total = exercises.length;
  const completed = answered.filter(Boolean).length;
  const correctCount = results.filter(Boolean).length;
  const progressPct = Math.round((completed / total) * 100);

  const handleAnswer = (correct: boolean) => {
    setResults((prev) => {
      const next = [...prev];
      next[current] = correct;
      return next;
    });
    setAnswered((prev) => {
      const next = [...prev];
      next[current] = true;
      return next;
    });
  };

  const goNext = () => {
    if (current < total - 1) setCurrent(current + 1);
  };
  const goPrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          ✍️ Ejercicios
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Practica lo aprendido con ejercicios interactivos. Recibirás
          retroalimentación inmediata después de cada respuesta.
        </p>
      </div>

      {/* Barra de progreso de la sesión */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Progreso de la práctica
            </span>
            <span className="text-sm text-muted-foreground">
              {completed} de {total} · {correctCount} correctas
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </CardContent>
      </Card>

      {/* Ejercicio actual — `key` fuerza remount al cambiar y resetea el estado interno */}
      <ExerciseRunner
        key={exercises[current].id}
        exercise={exercises[current]}
        index={current}
        total={total}
        instantFeedback
        onAnswer={handleAnswer}
      />

      {/* Navegación entre ejercicios */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={current === 0}
          className="min-h-[44px]"
        >
          <ChevronLeft className="size-4 mr-1" />
          Anterior
        </Button>
        <div className="flex items-center gap-1">
          {exercises.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`size-2.5 rounded-full transition-all ${
                i === current
                  ? "bg-primary w-6"
                  : answered[i]
                    ? results[i]
                      ? "bg-emerald-500"
                      : "bg-red-400"
                    : "bg-muted-foreground/30"
              }`}
              aria-label={`Ir al ejercicio ${i + 1}`}
            />
          ))}
        </div>
        {current < total - 1 ? (
          <Button
            variant="default"
            size="sm"
            onClick={goNext}
            disabled={!answered[current]}
            className="min-h-[44px]"
          >
            Siguiente
            <ChevronRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 h-9 px-3">
            <Trophy className="size-3.5 mr-1" />
            ¡Práctica completada!
          </Badge>
        )}
      </div>

      {/* Resumen final */}
      {completed === total && (
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-2" aria-hidden>
              {correctCount / total >= 0.8 ? "🎉" : correctCount / total >= 0.5 ? "👍" : "💪"}
            </div>
            <h3 className="text-lg font-bold mb-1">
              Obtuviste {correctCount} de {total} respuestas correctas
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {correctCount / total >= 0.8
                ? "¡Excelente trabajo! Estás listo para la evaluación final."
                : correctCount / total >= 0.5
                  ? "Buen intento. Revisa el vocabulario y vuelve a intentarlo."
                  : "No te desanimes. Repasa la lección y practica de nuevo."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrent(0);
                setResults(exercises.map(() => false));
                setAnswered(exercises.map(() => false));
              }}
            >
              Repetir práctica
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
