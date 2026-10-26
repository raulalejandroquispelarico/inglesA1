"use client";

import { useEffect, useState } from "react";
import { COURSE_UNITS, CourseUnit } from "@/data/course";
import { useProgress } from "@/hooks/use-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Lock, Clock, BookOpen, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

interface HomeViewProps {
  onOpenUnit: (unitId: number) => void;
}

export function HomeView({ onOpenUnit }: HomeViewProps) {
  const { progress } = useProgress();

  // PATRÓN CLIENT-ONLY: renderizamos un loader durante SSR y el primer
  // render del cliente. Solo después del mount mostramos el contenido real.
  // Esto ELIMINA cualquier posibilidad de hydration mismatch porque el
  // servidor y el primer render del cliente devuelven exactamente lo mismo
  // (el loader). El contenido real aparece en el segundo render del cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Pantalla de carga (server + primer render del cliente)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Cargando curso…</p>
        </div>
      </div>
    );
  }

  // Contenido real (solo cliente, después del mount)
  const overall = Math.round(
    Object.values(progress).reduce(
      (sum, u) => sum + (u.progress ?? 0) / 12,
      0
    )
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-teal-700 text-primary-foreground">
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute top-10 left-10 text-9xl">📚</div>
          <div className="absolute bottom-10 right-10 text-9xl">🎓</div>
          <div className="absolute top-1/2 left-1/2 text-8xl">✨</div>
        </div>
        <div className="relative px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-6xl mx-auto pt-safe">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🇬🇧</span>
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">
              Nivel A1 · Principiante
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            Inglés A1 para Hispanohablantes
          </h1>
          <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mb-6">
            Curso interactivo y gratuito para aprender inglés desde cero.
            Diseñado específicamente para hablantes nativos de español, con
            pronunciación, vocabulario, gramática y ejercicios prácticos.
          </p>

          {/* Progreso general */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 max-w-md border border-primary-foreground/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso del curso</span>
              <span className="text-sm font-bold">{overall}%</span>
            </div>
            <Progress value={overall} className="h-2 bg-primary-foreground/20" />
            <p className="text-xs text-primary-foreground/80 mt-2">
              {overall === 0
                ? "Empieza con la Unidad 1: Hello — Personal Introductions"
                : `${Math.max(1, Math.round(overall / 8.33))} de 12 unidades iniciadas`}
            </p>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="size-6 text-primary" />
              Unidades del curso
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              12 unidades · 36 lecciones · 72 horas de contenido
            </p>
          </div>
        </div>

        {/* Grid de unidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {COURSE_UNITS.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              unitProgress={progress[unit.id]}
              onOpen={() => onOpenUnit(unit.id)}
            />
          ))}
        </div>

        {/* Sección informativa */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon="📱"
            title="Funciona en tu celular"
            text="Diseñado mobile-first. Instalable como app en Android y Windows."
          />
          <InfoCard
            icon="🔊"
            title="Pronunciación incluida"
            text="Escucha cada palabra y diálogo con un clic, gracias a la síntesis de voz."
          />
          <InfoCard
            icon="📴"
            title="Modo offline"
            text="Tu progreso se guarda en el dispositivo, sin necesidad de conexión."
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            Inglés A1 · Curso educativo para hispanohablantes ·{" "}
            <span className="font-medium text-foreground">
              Raul Alejandro Quispe Larico
            </span>
          </p>
          <p className="mt-1 text-xs">
            Hecho con Next.js, TypeScript y tecnologías de código abierto.
          </p>
        </div>
      </footer>
    </div>
  );
}

function UnitCard({
  unit,
  unitProgress,
  onOpen,
}: {
  unit: CourseUnit;
  unitProgress?: { progress: number; evaluationScore?: number };
  onOpen: () => void;
}) {
  const isAvailable = unit.status === "available";
  const isComingSoon = unit.status === "coming-soon";
  const isCompleted = (unitProgress?.progress ?? 0) >= 100;
  const pct = unitProgress?.progress ?? 0;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 ${
        isAvailable
          ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-primary/20"
          : "opacity-70"
      }`}
      onClick={() => isAvailable && onOpen()}
      role={isAvailable ? "button" : undefined}
      tabIndex={isAvailable ? 0 : -1}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Unidad ${unit.id}: ${unit.titleEn}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex items-center justify-center size-12 sm:size-14 rounded-xl text-2xl sm:text-3xl shrink-0 ${
                isAvailable
                  ? "bg-primary/10 group-hover:bg-primary/15"
                  : "bg-muted"
              }`}
              aria-hidden
            >
              {isComingSoon ? "🔒" : unit.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Unidad {unit.id}
              </p>
              <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2">
                {unit.titleEn}
              </CardTitle>
            </div>
          </div>
          {isCompleted && (
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" aria-label="Completada" />
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3 min-h-[3.5rem]">
          {unit.summary}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {unit.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" />
            {unit.lessons} lecciones
          </span>
        </div>

        {isAvailable && pct > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between">
          {isComingSoon ? (
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              Próximamente
            </Badge>
          ) : isAvailable ? (
            <Badge
              className="gap-1 bg-primary/10 text-primary hover:bg-primary/15"
              variant="outline"
            >
              {pct > 0 ? "Continuar" : "Empezar"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Lock className="size-3" />
              Bloqueada
            </Badge>
          )}
          {isAvailable && (
            <ArrowRight className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-center sm:text-left">
      <div className="text-3xl mb-2" aria-hidden>
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
