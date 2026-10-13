"use client";

import { useEffect, useRef, useState } from "react";
import { Exercise } from "@/data/course";
import { ExerciseRunner } from "./ExerciseRunner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw, Award, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface EvaluationTabProps {
  exercises: Exercise[];
  unitId: number;
  onSubmitScore: (score: number) => void;
}

type Phase = "intro" | "in-progress" | "completed";

export function EvaluationTab({
  exercises,
  unitId,
  onSubmitScore,
}: EvaluationTabProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<boolean[]>(() =>
    exercises.map(() => false)
  );
  const [answered, setAnswered] = useState<boolean[]>(() =>
    exercises.map(() => false)
  );
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const total = exercises.length;

  // Pesos por tipo de ejercicio (la escritura libre vale por participación)
  const weights: Record<Exercise["type"], number> = {
    match: 20,
    "multiple-choice": 10,
    "fill-blank": 15,
    "word-order": 10,
    listening: 15,
    writing: 30,
  };
  const totalWeight = exercises.reduce((sum, ex) => sum + weights[ex.type], 0);

  // Bandera para evitar avances duplicados en el mismo ejercicio
  const advanceLockRef = useRef<number>(-1);

  // Solo actualiza resultados + answered. El avance lo decide el useEffect.
  const handleAnswer = (correct: boolean) => {
    setResults((prev) => {
      const next = [...prev];
      next[current] = correct;
      return next;
    });
    setAnswered((prev) => {
      if (prev[current]) return prev; // ya estaba contestado, no duplicar
      const next = [...prev];
      next[current] = true;
      return next;
    });
  };

  // Efecto que detecta cuando el ejercicio actual acaba de ser respondido
  // y programa el avance automático (excepto en la última pregunta, que
  // dispara el cálculo del puntaje final en otro efecto).
  useEffect(() => {
    if (phase !== "in-progress") return;
    if (!answered[current]) return;
    // Reinicia el lock si cambió el índice current (nuevo ejercicio)
    if (advanceLockRef.current !== current) {
      advanceLockRef.current = current;
    } else {
      return; // ya se programó el avance para este ejercicio
    }

    // Si es la última pregunta, no programar avance: el efecto de
    // finalización se encargará del cálculo.
    if (current >= total - 1) return;

    const timer = setTimeout(() => {
      setCurrent((c) => c + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [answered, current, phase, total]);

  // Score derivado: se calcula a partir de `results` cuando todas las
  // preguntas están respondidas. Sin estado duplicado.
  const allAnswered = answered.every(Boolean);
  const computedScore = allAnswered
    ? Math.round(
        (exercises.reduce(
          (sum, ex, i) => sum + (results[i] ? weights[ex.type] : 0),
          0
        ) /
          totalWeight) *
          100
      )
    : null;

  // Efecto de sincronización con el exterior (onSubmitScore + toast + fase).
  // Solo se ejecuta una vez por evaluación gracias a la guarda finalScore.
  useEffect(() => {
    if (phase !== "in-progress") return;
    if (finalScore !== null) return;
    if (computedScore === null) return;
    // Mutamos finalScore para bloquear re-ejecuciones; lo hacemos fuera del
    // render principal usando un microtask para no violar la regla de
    // setState-durante-render. El patrón es: disparar el callback al
    // exterior + avanzar de fase.
    Promise.resolve().then(() => {
      setFinalScore(computedScore);
      setPhase("completed");
      onSubmitScore(computedScore);
      toast.success(`Evaluación enviada. Puntaje: ${computedScore}/100`);
    });
  }, [phase, finalScore, computedScore, onSubmitScore]);

  const startEvaluation = () => {
    advanceLockRef.current = -1;
    setPhase("in-progress");
    setCurrent(0);
    setResults(exercises.map(() => false));
    setAnswered(exercises.map(() => false));
    setFinalScore(null);
  };

  /* ---------------- Fase introductoria ---------------- */
  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🏆 Evaluación Final
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Pon a prueba lo que aprendiste en esta unidad. La evaluación consta
            de {total} ejercicios y vale 20 puntos en total.
          </p>
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/15 text-2xl shrink-0">
                📝
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instrucciones</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Cada ejercicio se evalúa automáticamente.</li>
                  <li>
                    Puedes repetir la evaluación las veces que quieras para
                    mejorar tu puntaje.
                  </li>
                  <li>El puntaje se guarda en tu progreso del curso.</li>
                  <li>Duración estimada: 15 minutos.</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <StatBox label="Ejercicios" value={String(total)} />
              <StatBox label="Puntaje máx." value="100" />
              <StatBox label="Duración" value="15 min" />
              <StatBox label="Intentos" value="Ilimitados" />
            </div>

            <Button
              onClick={startEvaluation}
              size="lg"
              className="w-full sm:w-auto min-h-[48px]"
            >
              <Trophy className="size-4 mr-2" />
              Comenzar evaluación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- Fase completada ---------------- */
  if (phase === "completed" && finalScore !== null) {
    const passed = finalScore >= 70;
    return (
      <div className="space-y-6">
        <Card
          className={`border-2 ${
            passed
              ? "border-emerald-400 bg-emerald-50"
              : "border-amber-400 bg-amber-50"
          }`}
        >
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl" aria-hidden>
              {passed ? "🎉" : "💪"}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {passed ? "¡Felicidades!" : "Sigue practicando"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {passed
                  ? "Has completado satisfactoriamente la Unidad 1."
                  : "Aún puedes mejorar. Revisa el vocabulario y vuelve a intentarlo."}
              </p>
            </div>

            <div className="inline-flex items-baseline gap-1 px-6 py-3 rounded-xl bg-background border-2 border-current">
              <span className="text-4xl font-bold">{finalScore}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              <div className="rounded-lg bg-background p-3 border">
                <div className="text-xs text-muted-foreground mb-1">
                  Correctas
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {results.filter(Boolean).length}
                </div>
              </div>
              <div className="rounded-lg bg-background p-3 border">
                <div className="text-xs text-muted-foreground mb-1">
                  Incorrectas
                </div>
                <div className="text-xl font-bold text-red-500">
                  {results.filter((r) => !r).length}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button onClick={startEvaluation} variant="outline" size="sm">
                <RotateCcw className="size-4 mr-1.5" />
                Repetir evaluación
              </Button>
              {passed && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 h-9 px-4">
                  <Award className="size-4 mr-1.5" />
                  Unidad 1 completada
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {!passed && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">
                    ¿Necesitas repasar?
                  </p>
                  <p className="text-amber-700">
                    Vuelve a las pestañas de Vocabulario, Gramática y Diálogos
                    para reforzar los conceptos. La práctica constante es la
                    clave del aprendizaje.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  /* ---------------- Fase en progreso ---------------- */
  const progressPct = Math.round(
    (answered.filter(Boolean).length / total) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          📝 Evaluación en curso
        </h2>
        <Badge variant="outline" className="shrink-0">
          {current + 1} / {total}
        </Badge>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progreso de la evaluación</span>
          <span>{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      <ExerciseRunner
        key={exercises[current].id}
        exercise={exercises[current]}
        index={current}
        total={total}
        instantFeedback={false}
        onAnswer={handleAnswer}
      />

      <p className="text-xs text-center text-muted-foreground">
        La evaluación avanza automáticamente al responder.
      </p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background p-3 border text-center">
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-base font-bold">{value}</div>
    </div>
  );
}
