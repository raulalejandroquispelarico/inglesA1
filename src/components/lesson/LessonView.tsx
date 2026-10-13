"use client";

import { useEffect, useState } from "react";
import { CourseUnit, getUnitContent } from "@/data/course";
import { useProgress } from "@/hooks/use-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Volume2, BookOpen, MessageSquare, PenLine, CheckSquare, Sparkles } from "lucide-react";
import { VocabularyTab } from "./VocabularyTab";
import { GrammarTab } from "./GrammarTab";
import { DialoguesTab } from "./DialoguesTab";
import { ExercisesTab } from "./ExercisesTab";
import { EvaluationTab } from "./EvaluationTab";

interface LessonViewProps {
  unit: CourseUnit;
  onBack: () => void;
}

const TABS = [
  { id: "vocabulario", label: "Vocabulario", icon: BookOpen },
  { id: "gramatica", label: "Gramática", icon: Sparkles },
  { id: "dialogos", label: "Diálogos", icon: MessageSquare },
  { id: "ejercicios", label: "Ejercicios", icon: PenLine },
  { id: "evaluacion", label: "Evaluación", icon: CheckSquare },
] as const;

export function LessonView({ unit, onBack }: LessonViewProps) {
  const content = getUnitContent(unit.id);
  const { markTabVisited, getUnit, setEvaluationScore } = useProgress();
  const [activeTab, setActiveTab] = useState<string>("vocabulario");

  // Marca tab visitada al cambiar
  useEffect(() => {
    if (content) markTabVisited(unit.id, activeTab);
  }, [activeTab, unit.id, content, markTabVisited]);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-bold mb-2">Contenido en preparación</h2>
          <p className="text-muted-foreground mb-4">
            Esta unidad aún no está disponible. Vuelve pronto para seguir
            aprendiendo.
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="size-4 mr-2" />
            Volver al menú
          </Button>
        </div>
      </div>
    );
  }

  const unitProgress = getUnit(unit.id);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="px-3 sm:px-6 py-3 max-w-5xl mx-auto pt-safe">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Volver al menú"
              className="shrink-0 size-10"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center justify-center size-10 sm:size-12 rounded-xl bg-primary/10 text-2xl shrink-0" aria-hidden>
                {unit.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Unidad {unit.id}
                  </span>
                  {unitProgress.evaluationScore !== undefined && (
                    <Badge variant="outline" className="text-xs h-5 gap-1">
                      <CheckSquare className="size-3" />
                      {unitProgress.evaluationScore}/100
                    </Badge>
                  )}
                </div>
                <h1 className="text-sm sm:text-lg font-bold leading-tight truncate">
                  {unit.titleEn}
                </h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="size-4" />
              <span>Pronunciación activa</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs + contenido */}
      <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 max-w-5xl mx-auto w-full">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Tabs list: scroll horizontal en móvil, fija en desktop */}
          <TabsList
            className="flex w-full justify-start sm:justify-center overflow-x-auto scrollbar-thin h-auto p-1 bg-muted/50 mb-4 sm:mb-6"
            aria-label="Secciones de la lección"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap shrink-0"
                >
                  <Icon className="size-3.5 sm:size-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="vocabulario" className="mt-0 focus-visible:outline-none">
            <VocabularyTab
              fallbackVocabulary={content.vocabulary}
              unitId={unit.id}
              onGoToGrammar={() => setActiveTab("gramatica")}
            />
          </TabsContent>
          <TabsContent value="gramatica" className="mt-0 focus-visible:outline-none">
            <GrammarTab rules={content.grammar} />
          </TabsContent>
          <TabsContent value="dialogos" className="mt-0 focus-visible:outline-none">
            <DialoguesTab dialogues={content.dialogues} />
          </TabsContent>
          <TabsContent value="ejercicios" className="mt-0 focus-visible:outline-none">
            <ExercisesTab exercises={content.exercises} />
          </TabsContent>
          <TabsContent value="evaluacion" className="mt-0 focus-visible:outline-none">
            <EvaluationTab
              exercises={content.evaluation}
              unitId={unit.id}
              onSubmitScore={(score) => setEvaluationScore(unit.id, score)}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer con navegación entre tabs (móvil) */}
      <footer className="border-t bg-background sm:hidden">
        <div className="flex items-center justify-between p-2 gap-1 pb-safe">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const idx = TABS.findIndex((t) => t.id === activeTab);
              if (idx > 0) setActiveTab(TABS[idx - 1].id);
            }}
            disabled={activeTab === TABS[0].id}
            className="flex-1"
          >
            <ArrowLeft className="size-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const idx = TABS.findIndex((t) => t.id === activeTab);
              if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
              else onBack();
            }}
            className="flex-1"
          >
            {activeTab === TABS[TABS.length - 1].id ? "Finalizar" : "Siguiente"}
            <ArrowLeft className="size-4 ml-1 rotate-180" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
