"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  updateSettings,
} from "@/lib/settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
    const sync = () => setSettings(loadSettings());
    window.addEventListener("ingles-a1-settings-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ingles-a1-settings-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    const updated = updateSettings(patch);
    setSettings(updated);
  }, []);

  return { settings, update };
}
