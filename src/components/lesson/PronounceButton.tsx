"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { speak, stopSpeaking, isSpeechSupported } from "@/lib/speech";
import { toast } from "sonner";

interface PronounceButtonProps {
  text: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "ghost" | "outline";
  rate?: number;
  className?: string;
}

/**
 * Botón accesible que reproduce la pronunciación de un texto en inglés.
 * Usa Web Speech API (sin dependencias externas). Si el navegador no
 * soporta síntesis de voz, muestra un mensaje informativo.
 */
export function PronounceButton({
  text,
  label = "Escuchar",
  size = "sm",
  variant = "outline",
  rate = 0.85,
  className,
}: PronounceButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const handleClick = () => {
    if (!isSpeechSupported()) {
      toast.error(
        "Tu navegador no soporta síntesis de voz. Prueba con Chrome, Edge o Safari."
      );
      return;
    }
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, {
      rate,
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleClick}
      className={className}
      aria-label={`${label}: ${text}`}
      disabled={!isSpeechSupported()}
    >
      {speaking ? (
        <Loader2 className="size-3.5 sm:size-4 mr-1.5 animate-spin" />
      ) : (
        <Volume2 className="size-3.5 sm:size-4 mr-1.5" />
      )}
      {size !== "icon" && label}
    </Button>
  );
}
