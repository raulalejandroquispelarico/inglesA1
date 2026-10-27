"use client";

/**
 * Hook para detectar si el usuario está en un dispositivo con puntero
 * fino (mouse). Uso: diferenciar PC de móvil sin mirar user-agent.
 *
 * Por ahora NO se usa en TranslationItem (el usuario decidió no forzar
 * foco automático). Pero lo dejamos creado para usarlo en el futuro
 * cuando haga falta (ej: atajos de teclado distintos).
 */

import { useEffect, useState } from "react";

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(query.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    if (query.addEventListener) {
      query.addEventListener("change", handler);
      return () => query.removeEventListener("change", handler);
    }
    // Fallback para navegadores viejos.
    query.addListener(handler);
    return () => query.removeListener(handler);
  }, []);

  return isDesktop;
}
