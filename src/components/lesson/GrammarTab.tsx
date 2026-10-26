"use client";

import { GrammarRule } from "@/data/course";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PronounceButton } from "./PronounceButton";
import { Lightbulb } from "lucide-react";

interface GrammarTabProps {
  rules: GrammarRule[];
}

export function GrammarTab({ rules }: GrammarTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          ✨ Gramática
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Aprende las reglas esenciales con ejemplos prácticos. Haz clic en
          cualquier ejemplo en inglés para escuchar su pronunciación.
        </p>
      </div>

      {rules.map((rule, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardHeader className="bg-muted/40">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0"
                aria-hidden
              >
                {idx + 1}
              </div>
              <CardTitle className="text-lg sm:text-xl">{rule.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              {rule.explanation}
            </p>

            {/* Tabla de ejemplos */}
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                <div className="px-3 py-2 border-r">Inglés</div>
                <div className="px-3 py-2">Español</div>
              </div>
              <div className="divide-y">
                {rule.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 hover:bg-muted/30 transition-colors"
                  >
                    <div className="px-3 py-2.5 border-r flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{ex.en}</span>
                      <PronounceButton
                        text={ex.en}
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0 text-primary"
                        label="Escuchar ejemplo"
                      />
                    </div>
                    <div className="px-3 py-2.5 text-sm text-muted-foreground">
                      {ex.es}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {rule.tip && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/15 border border-accent/30">
                <Lightbulb className="size-5 text-accent-foreground shrink-0 mt-0.5" />
                <p className="text-sm">
                  <strong className="text-accent-foreground">Tip: </strong>
                  {rule.tip}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm flex items-start gap-2">
            <span className="text-xl" aria-hidden>📝</span>
            <span>
              <strong>Recuerda:</strong> La gramática inglesa es más regular de
              lo que parece. Una vez que dominas el verbo <em>to be</em> y los
              pronombres personales, tienes la base para construir cientos de
              frases útiles en presente.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
