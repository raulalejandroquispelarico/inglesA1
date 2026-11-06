/**
 * Índice de contenido del curso.
 * ===============================
 *
 * Exporta todas las unidades y una función para buscarlas por slug.
 */

import type { Unit } from "@/shared/types";
import { UNIT_00_TO } from "./unit-00-to";
import { UNIT_00_MIXTO } from "./unit-00-to-mixto";
import { UNIT_01 } from "./unit-01";

/**
 * Todas las unidades registradas, en orden de ID.
 * Las unidades de piloto (00) no aparecen en el Home.
 */
export const ALL_UNITS: Unit[] = [
  UNIT_00_TO,
  UNIT_00_MIXTO,
  UNIT_01,
].sort((a, b) => a.id - b.id);

/**
 * Busca una unidad por slug. Devuelve null si no existe.
 */
export function getUnitBySlug(slug: string): Unit | null {
  return ALL_UNITS.find((u) => u.slug === slug) ?? null;
}

/**
 * Devuelve solo las unidades que se muestran en el Home
 * (status "available" o "coming-soon", id > 0).
 */
export function getHomeUnits(): Unit[] {
  return ALL_UNITS.filter((u) => u.id > 0);
}

export { UNIT_00_TO, UNIT_00_MIXTO, UNIT_01 };
