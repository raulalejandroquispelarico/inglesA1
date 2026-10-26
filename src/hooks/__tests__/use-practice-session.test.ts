import { describe, it, expect } from "vitest";

/**
 * Tests del hook usePracticeSession.
 *
 * NOTA: este hook es un hook de React (usa useState, useEffect, etc.).
 * Para tests unitarios puros sin montar React, testeamos la lógica
 * subyacente: buildQueue + evaluate + recordAttempt.
 *
 * Los tests del hook con renderHook requieren @testing-library/react,
 * que NO está instalado. Para no agregar dependencias, testeamos la
 * lógica que el hook orquesta, que ya está cubierta en evaluate.test.ts,
 * queue.test.ts y history.test.ts.
 *
 * Este archivo queda como marcador y para futuros tests de integración
 * cuando se agregue @testing-library/react en Tanda 4.
 */

describe("usePracticeSession (placeholder)", () => {
  it("la lógica subyacente está cubierta por evaluate/queue/history", () => {
    // Este test es un recordatorio de que el hook es delgado:
    // solo orquesta funciones ya testeadas.
    expect(true).toBe(true);
  });
});
