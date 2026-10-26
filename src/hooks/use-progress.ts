"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CourseProgress,
  UnitProgress,
  getUnitProgress,
  loadProgress,
  saveProgress,
  updateUnitProgress,
} from "@/lib/storage";

/**
 * Hook para acceder y actualizar el progreso del curso desde cualquier
 * componente cliente. Se sincroniza entre pestañas vía el evento custom
 * 'ingles-a1-progress-updated' y el evento 'storage'.
 *
 * IMPORTANTE — Hidratación segura:
 * SIEMPRE inicializa con `{}` (vacío), tanto en SSR como en el primer
 * render del cliente. El progreso real se carga en un `useEffect`, por
 * lo que el HTML del servidor y del primer render del cliente son
 * idénticos. Esto evita el error "Hydration failed because the server
 * rendered text didn't match the client".
 */
export function useProgress() {
  // SIEMPRE empezar con {} — nunca leer localStorage en el render inicial.
  // El lazy-init con localStorage causaba mismatch SSR vs cliente.
  const [progress, setProgress] = useState<CourseProgress>({});

  useEffect(() => {
    // Cargar progreso real solo después del montaje (cliente).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadProgress());

    const sync = () => setProgress(loadProgress());
    window.addEventListener("ingles-a1-progress-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ingles-a1-progress-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const getUnit = useCallback(
    (unitId: number): UnitProgress => {
      return progress[unitId] ?? { progress: 0, visitedTabs: [] };
    },
    [progress]
  );

  const setUnit = useCallback((unitId: number, patch: Partial<UnitProgress>) => {
    updateUnitProgress(unitId, patch);
  }, []);

  const markTabVisited = useCallback((unitId: number, tabId: string) => {
    const current = getUnitProgress(unitId);
    const visited = new Set(current.visitedTabs ?? []);
    visited.add(tabId);
    const tabsCount = 5; // Vocabulario, Gramática, Diálogos, Ejercicios, Evaluación
    const progressPct = Math.round((visited.size / tabsCount) * 100);
    updateUnitProgress(unitId, {
      visitedTabs: Array.from(visited),
      progress: progressPct,
      completedAt:
        progressPct >= 100 ? new Date().toISOString() : current.completedAt,
    });
  }, []);

  const setEvaluationScore = useCallback(
    (unitId: number, score: number) => {
      updateUnitProgress(unitId, { evaluationScore: score });
    },
    []
  );

  const resetAll = useCallback(() => {
    saveProgress({});
  }, []);

  return { progress, getUnit, setUnit, markTabVisited, setEvaluationScore, resetAll };
}
