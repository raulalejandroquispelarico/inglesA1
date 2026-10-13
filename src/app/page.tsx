"use client";

import { useEffect, useState } from "react";
import { HomeView } from "@/components/home/HomeView";
import { LessonView } from "@/components/lesson/LessonView";
import { COURSE_UNITS } from "@/data/course";
import { toast } from "sonner";

type View =
  | { type: "home" }
  | { type: "lesson"; unitId: number };

export default function Home() {
  const [view, setView] = useState<View>({ type: "home" });

  // Maneja el botón "atrás" del navegador/celular para volver al menú
  useEffect(() => {
    if (view.type !== "lesson") return;
    const handler = (e: PopStateEvent) => {
      // Si el usuario vuelve atrás estando en una lección, regresamos al menú
      e.preventDefault();
      setView({ type: "home" });
    };
    window.history.pushState({ lessonView: true }, "");
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
    };
  }, [view]);

  const openUnit = (unitId: number) => {
    const unit = COURSE_UNITS.find((u) => u.id === unitId);
    if (!unit) return;
    if (unit.status !== "available") {
      toast.info(`La unidad "${unit.titleEn}" estará disponible próximamente.`);
      return;
    }
    setView({ type: "lesson", unitId });
    // scroll al inicio
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const goHome = () => {
    setView({ type: "home" });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  if (view.type === "lesson") {
    const unit = COURSE_UNITS.find((u) => u.id === view.unitId);
    if (!unit) {
      goHome();
      return null;
    }
    return <LessonView unit={unit} onBack={goHome} />;
  }

  return <HomeView onOpenUnit={openUnit} />;
}
