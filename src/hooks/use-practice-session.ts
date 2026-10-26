"use client";

/**
 * Hook que maneja una sesión de práctica.
 * ========================================
 *
 * Responsabilidades:
 *  - Construir la cola al montar (con buildQueue del motor).
 *  - Mantener el índice actual y la respuesta en curso.
 *  - Evaluar al presionar "Comprobar".
 *  - Registrar el intento en historial (recordAttempt).
 *  - Avanzar al siguiente.
 *
 * NO renderiza. Solo estado y lógica. El componente PracticeRunner
 * lo consume y renderiza.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildQueue,
  evaluate,
  loadState,
  recordAttempt,
  saveState,
} from "@/engine";
import type { EvaluationResult, QueueItem } from "@/engine";
import type { PersistedState, SessionMode, Unit } from "@/shared/types";

interface UsePracticeSessionParams {
  unit: Unit;
  mode?: SessionMode;
}

interface UsePracticeSessionResult {
  /** Ítem actual, o null si la sesión terminó. */
  currentItem: QueueItem | null;
  /** Índice actual (0-based). */
  index: number;
  /** Total de ítems en la cola. */
  total: number;
  /** Respuesta en curso. */
  answer: string;
  /** Resultado de la última evaluación (null si aún no comprobó). */
  result: EvaluationResult | null;
  /** Si la sesión terminó. */
  finished: boolean;
  /** Cambiar la respuesta en curso. */
  setAnswer: (value: string) => void;
  /** Evaluar la respuesta actual. */
  check: () => void;
  /** Avanzar al siguiente ítem (o marcar como terminado). */
  next: () => void;
  /** Aciertos de la sesión (solo para el resumen final). */
  sessionCorrect: number;
  /** Fallos de la sesión. */
  sessionIncorrect: number;
  /** Reiniciar la sesión desde cero. */
  restart: () => void;
}

export function usePracticeSession({
  unit,
  mode = "full",
}: UsePracticeSessionParams): UsePracticeSessionResult {
  const [state, setState] = useState<PersistedState | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionIncorrect, setSessionIncorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  // Cargar estado y construir cola al montar (solo cliente).
  useEffect(() => {
    const loaded = loadState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loaded);
    setQueue(buildQueue(unit, mode, loaded));
  }, [unit, mode]);

  const currentItem = useMemo<QueueItem | null>(() => {
    if (finished) return null;
    return queue[index] ?? null;
  }, [queue, index, finished]);

  const check = useCallback(() => {
    if (!currentItem) return;
    if (result !== null) return; // ya comprobado

    const evalResult = evaluate(currentItem.item, answer);
    setResult(evalResult);

    // Registrar en historial.
    recordAttempt(currentItem.item, unit.id, answer, evalResult);
    setState(loadState()); // refrescar estado tras guardar

    if (evalResult.correct) {
      setSessionCorrect((c) => c + 1);
    } else {
      setSessionIncorrect((c) => c + 1);
    }
  }, [currentItem, answer, result, unit.id]);

  const next = useCallback(() => {
    setResult(null);
    setAnswer("");

    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      setFinished(true);
      setIndex(nextIndex);
    } else {
      setIndex(nextIndex);
    }
  }, [index, queue.length]);

  const restart = useCallback(() => {
    // Reconstruir cola desde el estado actual (que ya tiene los intentos).
    const freshState = loadState();
    setState(freshState);
    setQueue(buildQueue(unit, mode, freshState));
    setIndex(0);
    setAnswer("");
    setResult(null);
    setSessionCorrect(0);
    setSessionIncorrect(0);
    setFinished(false);
  }, [unit, mode]);

  return {
    currentItem,
    index,
    total: queue.length,
    answer,
    result,
    finished,
    setAnswer,
    check,
    next,
    sessionCorrect,
    sessionIncorrect,
    restart,
  };
}
