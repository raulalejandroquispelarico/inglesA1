/**
 * Badge con la versión de la app. Se muestra arriba a la derecha en
 * todas las páginas (montado desde layout.tsx).
 *
 * Es un Server Component (no lleva "use client") porque la versión se
 * resuelve en el servidor vía src/shared/version.ts.
 */

import { APP_VERSION } from "@/shared/version";

export function AppVersionBadge() {
  return (
    <div className="pointer-events-none fixed top-2 right-2 z-50">
      <span
        className="pointer-events-auto inline-flex items-center rounded-full bg-foreground/80 text-background text-[10px] font-mono px-2 py-0.5 shadow-sm backdrop-blur-sm"
        title={`Inglés A1 — v${APP_VERSION}`}
      >
        v{APP_VERSION}
      </span>
    </div>
  );
}
