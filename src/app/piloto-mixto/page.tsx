"use client";

/**
 * Página /piloto-mixto — Valida los 8 tipos de PracticeItem.
 * ==========================================================
 */

import Link from "next/link";
import { UNIT_00_MIXTO } from "@/content/unit-00-to-mixto";
import { PracticeRunner } from "@/components/lesson/PracticeRunner";
import { ArrowLeft } from "lucide-react";

export default function PilotoMixtoPage() {
  return (
    <main className="container max-w-2xl mx-auto p-4 pb-24">
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>
        <h1 className="text-2xl font-bold">🧪 Piloto mixto — 8 tipos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prueba interna: un ítem de cada tipo de ejercicio.
        </p>
      </header>

      <PracticeRunner unit={UNIT_00_MIXTO} />
    </main>
  );
}
