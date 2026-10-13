"use client";

import { useState } from "react";
import { Dialogue } from "@/data/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PronounceButton } from "./PronounceButton";
import { Eye, EyeOff, MessageSquare, Play } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speech";

interface DialoguesTabProps {
  dialogues: Dialogue[];
}

export function DialoguesTab({ dialogues }: DialoguesTabProps) {
  const [showTranslation, setShowTranslation] = useState(true);

  // Reproduce el diálogo completo, alternando personas
  const playDialogue = (dialogue: Dialogue) => {
    let i = 0;
    const playNext = () => {
      if (i >= dialogue.lines.length) return;
      const line = dialogue.lines[i];
      speak(line.en, {
        rate: 0.85,
        onEnd: () => {
          i += 1;
          setTimeout(playNext, 600);
        },
      });
    };
    stopSpeaking();
    playNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            💬 Diálogos
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Practica con conversaciones reales. Escucha línea por línea o el
            diálogo completo, y repite en voz alta.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTranslation((v) => !v)}
          className="shrink-0"
        >
          {showTranslation ? (
            <>
              <EyeOff className="size-4 mr-2" />
              Ocultar español
            </>
          ) : (
            <>
              <Eye className="size-4 mr-2" />
              Mostrar español
            </>
          )}
        </Button>
      </div>

      {dialogues.map((dialogue, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardHeader className="bg-muted/40">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0"
                  aria-hidden
                >
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg leading-tight">
                    {dialogue.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dialogue.context}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={() => playDialogue(dialogue)}
                className="shrink-0"
              >
                <Play className="size-3.5 mr-1.5" />
                <span className="hidden sm:inline">Escuchar diálogo</span>
                <span className="sm:hidden">Play</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {dialogue.lines.map((line, i) => {
                const isA = line.speaker === "A";
                return (
                  <div
                    key={i}
                    className={`flex ${isA ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 ${
                        isA
                          ? "bg-primary/10 rounded-tl-sm"
                          : "bg-accent/20 rounded-tr-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-4 px-1.5 ${
                            isA ? "border-primary/30 text-primary" : "border-accent-foreground/30 text-accent-foreground"
                          }`}
                        >
                          {line.speaker}
                        </Badge>
                        <PronounceButton
                          text={line.en}
                          size="icon"
                          variant="ghost"
                          className="size-6 text-muted-foreground hover:text-foreground"
                          label={`Escuchar línea ${i + 1}`}
                        />
                      </div>
                      <p className="text-sm sm:text-base font-medium">
                        {line.en}
                      </p>
                      {showTranslation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {line.es}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-accent/10 border-accent/30">
        <CardContent className="pt-6">
          <p className="text-sm flex items-start gap-2">
            <MessageSquare className="size-5 shrink-0 mt-0.5 text-accent-foreground" />
            <span>
              <strong>Práctica recomendada:</strong> Escucha el diálogo completo
              1 vez. Luego repite cada línea en voz alta después del audio.
              Finalmente, intenta leer el diálogo junto con un compañero o en
              voz alta asumiendo ambos roles.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
