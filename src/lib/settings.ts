/**
 * Almacén de configuración del usuario (persistente en localStorage).
 *
 * Modelo de 4 roles de voz: female1, female2, male1, male2.
 */

const SETTINGS_KEY = "ingles-a1-settings-v2";

export type VoiceRole = "female1" | "female2" | "male1" | "male2";

export interface AppSettings {
  female1?: number;
  female2?: number;
  male1?: number;
  male2?: number;
  speechRate?: number;
  soundVolume?: number;
  useAudioFiles?: boolean;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AppSettings;
    // Migración desde v1
    const v1Raw = localStorage.getItem("ingles-a1-settings-v1");
    if (v1Raw && !parsed.female1 && !parsed.male1) {
      try {
        const v1 = JSON.parse(v1Raw);
        if (typeof v1.voiceA === "number") parsed.female1 = v1.voiceA;
        if (typeof v1.voiceB === "number") parsed.male1 = v1.voiceB;
      } catch {
        // ignore
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("ingles-a1-settings-updated"));
  } catch (e) {
    console.warn("No se pudo guardar la configuración:", e);
  }
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const current = loadSettings();
  const updated: AppSettings = { ...current, ...patch };
  saveSettings(updated);
  return updated;
}

export const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 0.85,
  soundVolume: 0.3,
  useAudioFiles: false,
};

export const VOICE_ROLE_LABELS: Record<
  VoiceRole,
  { label: string; description: string; gender: "female" | "male" }
> = {
  female1: {
    label: "Femenina 1",
    description: "Voz femenina principal (rol A por defecto)",
    gender: "female",
  },
  female2: {
    label: "Femenina 2",
    description: "Segunda voz femenina (para diálogos con 2 mujeres)",
    gender: "female",
  },
  male1: {
    label: "Masculina 1",
    description: "Voz masculina principal (rol B por defecto)",
    gender: "male",
  },
  male2: {
    label: "Masculina 2",
    description: "Segunda voz masculina (para diálogos con 2 hombres)",
    gender: "male",
  },
};
