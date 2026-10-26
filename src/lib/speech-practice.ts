/**
 * Helper de TTS para la práctica.
 * ================================
 *
 * Diferente de src/lib/speech.ts (que es de la app vieja). Este está
 * pensado para el motor nuevo y es más simple.
 *
 * No toca el speech.ts existente para no romper la app vieja.
 */

/**
 * Lee un texto en inglés usando Web Speech API.
 * No-op si el navegador no soporta o estamos en SSR.
 */
export function speakEnglish(text: string): void {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  if (!text.trim()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}
