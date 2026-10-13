"use client";

import { useEffect } from "react";

/**
 * Gestiona el Service Worker para soporte offline e instalación PWA.
 *
 * - En DESARROLLO: desinstala silenciosamente cualquier SW existente y
 *   limpia las caches, SIN recargar la página (evita bucles de recarga
 *   en Android donde el SW tarda en desinstalarse).
 * - En PRODUCCIÓN: registra el SW para soporte offline y PWA.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      // EN DESARROLLO: desinstalar SWs y limpiar caches silenciosamente.
      // NO recargar la página (causaba bucle infinito en Android).
      (async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            try {
              await reg.unregister();
              console.log("[PWA] Dev: SW desinstalado");
            } catch {
              // ignore
            }
          }
          if ("caches" in window) {
            const cacheKeys = await caches.keys();
            for (const key of cacheKeys) {
              try {
                await caches.delete(key);
              } catch {
                // ignore
              }
            }
          }
        } catch {
          // ignore silenciosamente en dev
        }
      })();
      return;
    }

    // EN PRODUCCIÓN: registrar el SW para soporte offline y PWA.
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("[PWA] Service worker registrado");
        })
        .catch((err) => {
          console.warn("[PWA] No se pudo registrar el service worker:", err);
        });
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
