"use client";

/**
 * Página piloto — Integración del motor con UI.
 * ==============================================
 *
 * Aislada del Home. Solo se accede por /piloto.
 * Sirve para validar el motor completo antes de migrar las unidades
 * reales en Tanda 4.
 */

import Link from "next/link";
import { UNIT_00_TO } from "@/content/unit-00-to";
import { PracticeRunner } from "@/components/lesson/PracticeRunner";
import { ArrowLeft } from "lucide-react";

export default function PilotoPage() {
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
        <h1 className="text-2xl font-bold">🧪 Piloto — Preposición TO</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prueba interna del motor adaptativo. Traduce cada frase al inglés.
        </p>
      </header>

      <PracticeRunner unit={UNIT_00_TO} />
    </main>
  );
}
