/**
 * Helper para síntesis de voz usando Web Speech API.
 *
 * Modelo de 4 roles de voz configurables por el usuario:
 * - female1: voz femenina principal
 * - female2: segunda voz femenina
 * - male1: voz masculina principal
 * - male2: segunda voz masculina
 */

import { loadSettings, type VoiceRole } from "./settings";

let cachedVoices: SpeechSynthesisVoice[] = [];

function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function refreshVoices(): void {
  if (!isSupported()) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (isSupported()) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

/**
 * Retorna todas las voces en inglés disponibles en el navegador.
 */
export function getAvailableEnglishVoices(): SpeechSynthesisVoice[] {
  if (!isSupported()) return [];
  if (cachedVoices.length === 0) refreshVoices();
  return cachedVoices.filter((v) => v.lang.toLowerCase().startsWith("en"));
}

const FEMALE_NAMES = [
  "female", "woman", "girl",
  "samantha", "victoria", "karen", "moira", "tessa", "fiona",
  "zira", "hazel", "susan", "linda", "heather", "catherine",
  "amy", "emma", "joanna", "kendra", "salli", "kimberly",
  "google us english", "google uk english female",
  "aria", "jenny", "michelle",
];

const MALE_NAMES = [
  "male", "man", "boy",
  "alex", "daniel", "fred", "tom", "diego",
  "david", "mark", "george", "james", "rishi",
  "matthew", "justin", "joey", "brian",
  "google uk english male",
  "guy", "eric",
];

/**
 * Retorna las voces en inglés filtradas por género (heurística por nombre).
 */
export function getEnglishVoicesByGender(
  gender: "female" | "male"
): SpeechSynthesisVoice[] {
  const all = getAvailableEnglishVoices();
  const lowerNames = (v: SpeechSynthesisVoice) => v.name.toLowerCase();

  if (gender === "female") {
    const filtered = all.filter((v) =>
      FEMALE_NAMES.some((n) => lowerNames(v).includes(n))
    );
    return filtered.length > 0 ? filtered : all;
  }

  const filtered = all.filter((v) =>
    MALE_NAMES.some((n) => lowerNames(v).includes(n))
  );
  return filtered.length > 0 ? filtered : all;
}

export type VoiceGender = "female" | "male" | "any";

const DEFAULT_SPEAKER_ROLES: Record<string, VoiceRole> = {
  A: "female1",
  B: "male1",
  C: "female2",
  D: "male2",
};

/**
 * Resuelve la voz a usar según el rol configurado.
 */
function resolveVoiceByRole(role: VoiceRole): SpeechSynthesisVoice | undefined {
  const settings = loadSettings();
  const enVoices = getAvailableEnglishVoices();

  const configuredIndex = settings[role];
  if (
    typeof configuredIndex === "number" &&
    configuredIndex >= 0 &&
    configuredIndex < enVoices.length
  ) {
    return enVoices[configuredIndex];
  }

  // Fallback: heurística por género del rol
  const gender = role.startsWith("female") ? "female" : "male";
  const genderVoices = getEnglishVoicesByGender(gender);

  // Para female2/male2, usar la segunda voz disponible
  if (role === "female2" || role === "male2") {
    if (genderVoices.length > 1) {
      return genderVoices[1];
    }
  }
  return genderVoices[0];
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceRole?: VoiceRole;
  speaker?: string;
  gender?: VoiceGender;
  voiceIndex?: number;
  onEnd?: () => void;
  onStart?: () => void;
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!isSupported()) {
    console.warn("Tu navegador no soporta síntesis de voz.");
    options.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  let voice: SpeechSynthesisVoice | undefined;

  if (typeof options.voiceIndex === "number") {
    const enVoices = getAvailableEnglishVoices();
    voice = enVoices[options.voiceIndex];
  } else if (options.voiceRole) {
    voice = resolveVoiceByRole(options.voiceRole);
  } else if (options.speaker) {
    const role = DEFAULT_SPEAKER_ROLES[options.speaker] ?? "female1";
    voice = resolveVoiceByRole(role);
  } else if (options.gender) {
    const role = options.gender === "female" ? "female1" : "male1";
    voice = resolveVoiceByRole(role);
  }

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }

  const settings = loadSettings();
  utterance.rate = options.rate ?? settings.speechRate ?? 0.85;
  utterance.pitch = options.pitch ?? 1;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSupported()) return;
  window.speechSynthesis.cancel();
}

export function isSpeechSupported(): boolean {
  return isSupported();
}
