/**
 * Helper para reproducir sonidos de feedback (correcto / error) usando
 * Web Audio API o archivos de audio pre-grabados.
 *
 * El usuario puede reemplazar los tonos generados con archivos de audio
 * reales colocándolos en:
 *   public/sounds/correct.mp3
 *   public/sounds/error.mp3
 */

import { loadSettings } from "./settings";

let audioContext: AudioContext | null = null;
const audioCache: Record<string, HTMLAudioElement> = {};

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioContext = new AC();
    } catch {
      return null;
    }
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  startTime?: number;
  volume?: number;
}

function playTone({
  frequency,
  duration,
  type = "sine",
  startTime = 0,
  volume = 0.3,
}: ToneOptions): void {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + startTime + duration
  );

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration + 0.05);
}

function playAudioFile(name: string, volume: number): void {
  if (typeof window === "undefined") return;
  try {
    if (!audioCache[name]) {
      const audio = new Audio(`/sounds/${name}.mp3`);
      audio.volume = Math.min(1, Math.max(0, volume));
      audioCache[name] = audio;
    } else {
      audioCache[name].volume = Math.min(1, Math.max(0, volume));
    }
    const audio = audioCache[name];
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        playToneForSound(name as SoundType, volume);
      });
    }
  } catch {
    playToneForSound(name as SoundType, volume);
  }
}

function playToneForSound(type: SoundType, volume: number): void {
  switch (type) {
    case "correct":
      playTone({ frequency: 523.25, duration: 0.15, startTime: 0, volume });
      playTone({ frequency: 659.25, duration: 0.15, startTime: 0.12, volume });
      playTone({ frequency: 783.99, duration: 0.25, startTime: 0.24, volume });
      break;
    case "error":
      playTone({
        frequency: 220,
        duration: 0.18,
        type: "sawtooth",
        startTime: 0,
        volume: volume * 0.8,
      });
      playTone({
        frequency: 174.61,
        duration: 0.3,
        type: "sawtooth",
        startTime: 0.15,
        volume: volume * 0.8,
      });
      break;
    case "click":
      playTone({
        frequency: 1046.5,
        duration: 0.06,
        type: "triangle",
        volume: volume * 0.5,
      });
      break;
  }
}

export type SoundType = "correct" | "error" | "click";

export function playSound(type: SoundType): void {
  if (typeof window === "undefined") return;
  const settings = loadSettings();
  const volume = settings.soundVolume ?? 0.3;

  if (settings.useAudioFiles) {
    playAudioFile(type, volume);
    return;
  }
  playToneForSound(type, volume);
}

export function isAudioSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "AudioContext" in window || "webkitAudioContext" in window;
}
