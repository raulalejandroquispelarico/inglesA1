"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import {
  getAvailableEnglishVoices,
  getEnglishVoicesByGender,
  speak,
} from "@/lib/speech";
import { playSound } from "@/lib/sounds";
import { VOICE_ROLE_LABELS, type VoiceRole } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { settings, update } = useSettings();
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const load = () => {
      const v = getAvailableEnglishVoices();
      if (v.length > 0) setAllVoices(v);
    };
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    const t = setTimeout(load, 500);
    return () => clearTimeout(t);
  }, []);

  const handleTestVoice = (index: number) => {
    speak("Hello! Nice to meet you. How are you today?", {
      voiceIndex: index,
      rate: settings.speechRate ?? 0.85,
    });
  };

  const handleTestSound = (type: "correct" | "error") => {
    playSound(type);
  };

  const handleReset = () => {
    update({
      female1: undefined,
      female2: undefined,
      male1: undefined,
      male2: undefined,
      speechRate: 0.85,
      soundVolume: 0.3,
      useAudioFiles: false,
    });
    toast.success("Configuración restablecida");
  };

  const handleSave = () => {
    toast.success("Configuración guardada");
    onBack();
  };

  const femaleVoices = getEnglishVoicesByGender("female");
  const maleVoices = getEnglishVoicesByGender("male");

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="px-3 sm:px-6 py-3 max-w-4xl mx-auto pt-safe flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Volver al menú"
            className="shrink-0 size-10"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Configuración
            </p>
            <h1 className="text-base sm:text-lg font-bold leading-tight truncate">
              Ajustes del curso
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Voces para diálogos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
                <Volume2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Voces para diálogos</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Configura las 4 voces para los personajes A, B, C, D.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {allVoices.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                Tu navegador no tiene voces en inglés instaladas. Instala una
                voz <code>en-US</code> desde los ajustes de idioma del sistema.
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">
                      Voces femeninas
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {femaleVoices.length} disponibles
                    </span>
                  </div>
                  <VoiceSelector
                    role="female1"
                    voices={femaleVoices}
                    allVoices={allVoices}
                    selectedIndex={settings.female1}
                    onSelect={(idx) => update({ female1: idx })}
                    onTest={handleTestVoice}
                  />
                  <VoiceSelector
                    role="female2"
                    voices={femaleVoices}
                    allVoices={allVoices}
                    selectedIndex={settings.female2}
                    onSelect={(idx) => update({ female2: idx })}
                    onTest={handleTestVoice}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Voces masculinas
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {maleVoices.length} disponibles
                    </span>
                  </div>
                  <VoiceSelector
                    role="male1"
                    voices={maleVoices}
                    allVoices={allVoices}
                    selectedIndex={settings.male1}
                    onSelect={(idx) => update({ male1: idx })}
                    onTest={handleTestVoice}
                  />
                  <VoiceSelector
                    role="male2"
                    voices={maleVoices}
                    allVoices={allVoices}
                    selectedIndex={settings.male2}
                    onSelect={(idx) => update({ male2: idx })}
                    onTest={handleTestVoice}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Velocidad de voz */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Velocidad de voz</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Ajusta qué tan rápido hablan las voces.
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {Math.round((settings.speechRate ?? 0.85) * 100)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <input
                type="range"
                min={0.5}
                max={1.3}
                step={0.05}
                value={settings.speechRate ?? 0.85}
                onChange={(e) =>
                  update({ speechRate: parseFloat(e.target.value) })
                }
                className="w-full accent-primary h-2"
                aria-label="Velocidad de voz"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lenta (0.5x)</span>
                <span>Normal (1.0x)</span>
                <span>Rápida (1.3x)</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  speak("Hello! This is a speed test. How are you today?", {
                    rate: settings.speechRate ?? 0.85,
                  })
                }
              >
                <Volume2 className="size-4 mr-2" />
                Probar velocidad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sonidos de feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sonidos de feedback</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Sonidos de correcto/error.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Volumen</label>
                <Badge variant="outline">
                  {Math.round((settings.soundVolume ?? 0.3) * 100)}%
                </Badge>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={settings.soundVolume ?? 0.3}
                onChange={(e) =>
                  update({ soundVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-primary h-2"
                aria-label="Volumen de sonidos"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestSound("correct")}
              >
                <span className="text-emerald-600 mr-2">✓</span>
                Probar correcto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestSound("error")}
              >
                <span className="text-red-600 mr-2">✗</span>
                Probar error
              </Button>
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="useAudioFiles"
                  checked={settings.useAudioFiles ?? false}
                  onChange={(e) => update({ useAudioFiles: e.target.checked })}
                  className="mt-0.5 size-4 accent-primary"
                />
                <div className="flex-1">
                  <label
                    htmlFor="useAudioFiles"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Usar archivos de audio personalizados
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coloca archivos en{" "}
                    <code className="text-foreground bg-muted px-1 rounded">public/sounds/correct.mp3</code>{" "}
                    y{" "}
                    <code className="text-foreground bg-muted px-1 rounded">public/sounds/error.mp3</code>.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 pb-4">
          <Button onClick={handleSave} className="flex-1" size="lg">
            <Save className="size-4 mr-2" />
            Guardar y volver
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            aria-label="Restablecer"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

function VoiceSelector({
  role,
  voices,
  allVoices,
  selectedIndex,
  onSelect,
  onTest,
}: {
  role: VoiceRole;
  voices: SpeechSynthesisVoice[];
  allVoices: SpeechSynthesisVoice[];
  selectedIndex?: number;
  onSelect: (index: number) => void;
  onTest: (index: number) => void;
}) {
  const { label, description } = VOICE_ROLE_LABELS[role];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
        {voices.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            No hay voces de este género disponibles.
          </p>
        ) : (
          voices.map((voice) => {
            const realIndex = allVoices.findIndex(
              (v) => v.name === voice.name && v.lang === voice.lang
            );
            const isSelected = selectedIndex === realIndex;
            return (
              <div
                key={`${voice.name}-${voice.lang}`}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(realIndex)}
                  className="flex-1 text-left min-w-0"
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-4 rounded-full border-2 shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {voice.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {voice.lang}
                        {voice.default ? " · (default)" : ""}
                      </p>
                    </div>
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-primary"
                  onClick={() => onTest(realIndex)}
                  aria-label={`Probar voz ${voice.name}`}
                >
                  <Volume2 className="size-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
