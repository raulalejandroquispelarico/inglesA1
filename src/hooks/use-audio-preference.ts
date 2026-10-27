"use client";

/**
 * Hook para manejar la preferencia de audio (mute on/off).
 * ========================================================
 *
 * Persiste en localStorage. Valor por defecto: audio ACTIVADO.
 *
 * En SSR (primer render) devuelve `true` (activado) para evitar
 * hydration mismatch. La preferencia real se lee en useEffect.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ingles-a1-audio-pref-v1";
const EVENT_NAME = "ingles-a1-audio-pref-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readPreference(): boolean {
  if (!isBrowser()) return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === "true";
  } catch {
    return true;
  }
}

function writePreference(enabled: boolean): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.warn("No se pudo guardar la preferencia de audio:", e);
  }
}

/**
 * Devuelve `[audioEnabled, setAudioEnabled]`.
 * `audioEnabled = true` significa que el audio está activo
 * (no en mute).
 */
export function useAudioPreference(): {
  audioEnabled: boolean;
  setAudioEnabled: (value: boolean) => void;
  toggle: () => void;
} {
  const [audioEnabled, setAudioEnabledState] = useState<boolean>(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAudioEnabledState(readPreference());

    const sync = () => setAudioEnabledState(readPreference());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setAudioEnabled = useCallback((value: boolean) => {
    setAudioEnabledState(value);
    writePreference(value);
  }, []);

  const toggle = useCallback(() => {
    setAudioEnabled(!audioEnabled);
  }, [audioEnabled, setAudioEnabled]);

  return { audioEnabled, setAudioEnabled, toggle };
}
