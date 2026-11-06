"use client";

/**
 * Página dinámica de lección.
 * ===========================
 *
 * Carga la unidad por slug y la pasa al PracticeRunner.
 * Si el slug no existe, muestra "Unidad no encontrada".
 *
 * Ruta: /leccion/[slug]
 * Ejemplo: /leccion/hello-personal-introductions
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { getUnitBySlug } from "@/content";
import { PracticeRunner } from "@/components/lesson/PracticeRunner";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function LeccionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const unit = getUnitBySlug(slug);

  if (!unit) {
    return (
      <main className="container max-w-2xl mx-auto p-4 pb-24">
        <header className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>
        </header>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <AlertTriangle className="size-12 mx-auto text-amber-500" />
            <h1 className="text-xl font-semibold">Unidad no encontrada</h1>
            <p className="text-sm text-muted-foreground">
              El slug <code className="font-mono">{slug || "(vacío)"}</code>{" "}
              no corresponde a ninguna unidad registrada.
            </p>
            <Link
              href="/"
              className="inline-block text-sm text-primary hover:underline"
            >
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

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
        <h1 className="text-2xl font-bold">
          {unit.icon} {unit.titleEs}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{unit.title}</p>
      </header>

      <PracticeRunner unit={unit} />
    </main>
  );
}
