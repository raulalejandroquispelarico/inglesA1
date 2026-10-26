# Arquitectura — Inglés A1 (PWA adaptativa)

> Documento maestro del proyecto. Define cómo se separan el **motor**,
> el **contenido** y el **historial**, y cómo se comunican. Cualquier
> persona (o IA) que trabaje en este repo debe leer esto primero.

**Versión del documento:** 1.0
**Última actualización:** 2026-10-13
**Estado:** Aprobado, pendiente de implementación

---

## 1. Principio rector

El proyecto se divide en **tres capas independientes**:

```
┌───────────────────────────────────────────────────┐
│  CAPA 1 — MOTOR                                   │
│  Lógica pura. No sabe de inglés, ni de A1,        │
│  ni de "family", ni de "to be". Solo sabe que     │
│  hay ítems, respuestas y reglas de error.         │
│                                                   │
│  · Cola adaptativa                                │
│  · Evaluación por reglas                          │
│  · Repetición espaciada                           │
│  · Historial y exportación                        │
│  · Audio (TTS y reconocimiento)                   │
└───────────────────────────────────────────────────┘
                     ▲
                     │ consume un contrato tipado
                     ▼
┌───────────────────────────────────────────────────┐
│  CAPA 2 — CONTENIDO                               │
│  Un archivo por unidad. Datos puros.              │
│  Aquí SÍ se sabe de inglés A1, de familia, etc.   │
│                                                   │
│  · unit-01.ts → Hello / Personal Introductions    │
│  · unit-02.ts → My Family and Friends             │
│  · unit-03.ts → Numbers, Dates and Time           │
│  · ...                                            │
└───────────────────────────────────────────────────┘
                     ▲
                     │ genera
                     ▼
┌───────────────────────────────────────────────────┐
│  CAPA 3 — HISTORIAL (por alumno, por dispositivo) │
│  Se guarda en localStorage. Es la materia prima   │
│  para que una IA genere contenido nuevo.          │
│                                                   │
│  · Qué respondió el alumno                        │
│  · Qué error se detectó                           │
│  · Cuándo                                         │
│  · Exportable a JSON con cabecera para IA         │
└───────────────────────────────────────────────────┘
```

**Regla de oro:** el motor nunca importa nada de `src/content/`.
El contenido nunca importa nada de `src/engine/`.
Solo se comunican a través de `src/shared/types.ts`.

---

## 2. Capa 1 — El Motor

### 2.1. Qué hace

1. **Cargar** el contenido de una unidad (le pasan el archivo, no lo busca).
2. **Construir una cola de práctica** a partir de:
   - Todos los ítems de la unidad, si es la primera vez.
   - Solo los ítems fallados que aún no se dominan, si hay historial.
   - Ítems programados para repaso espaciado (SM-2 simplificado).
3. **Presentar cada ítem** según su tipo (multiple-choice, fill-blank, etc.).
4. **Evaluar la respuesta**:
   - Normalizar texto (ver §2.3).
   - Comparar contra `expected[]` y `acceptableAnswers[]`.
   - Si falla, correr `errorRules` para diagnosticar.
5. **Registrar** el intento en el historial.
6. **Actualizar** el estado del ítem (dominado / a repasar / en cola).
7. **Exportar** el historial en formato listo para una IA.

### 2.2. Qué NO hace

- No conoce el contenido ni el idioma.
- No decide qué es "correcto pedagógicamente" (eso viene en `errorRules`).
- No sabe de niveles MCER (solo guarda `cefr` como metadato).
- No tiene UI propia. Es lógica pura + hooks que la UI consume.

### 2.3. Normalización de texto (respuesta al problema de apóstrofes)

**Problema detectado en producción:** distintos apóstrofes Unicode
(' ' ` ´) hacían que respuestas correctas se marcaran como incorrectas.
Igual con mayúsculas iniciales y puntuación final.

**Solución:** función `normalize()` en `src/engine/normalize.ts`:
- NFKC Unicode.
- Unifica 10 variantes de apóstrofe a ASCII `'`.
- Unifica comillas dobles y guiones largos.
- Colapsa espacios.
- Elimina puntuación final.
- Lowercase al final.

**Reglas de decisión:**
- Mayúsculas iniciales: no cuentan.
- Puntuación final: no cuenta.
- Apóstrofes: todos se unifican.
- Espacios múltiples: colapsan.
- Tildes en español: sí cuentan (son errores reales en inglés).
- Puntuación interna: sí cuenta.

**Casos que necesitan `acceptableAnswers` explícito:** variantes
regionales legítimas que la normalización NO debe unificar (ej: "I go
to work by bus" vs "I go to work on the bus").

### 2.4. Cola adaptativa

**Estados posibles de un ítem:** `new`, `learning`, `review`, `mastered`.

**Construcción de la cola:**
1. Ítems `new` de la unidad (en orden pedagógico del contenido).
2. Ítems `learning` (los que fallaron).
3. Ítems `review` cuyo `nextReview <= hoy`.
4. Los `mastered` solo si el alumno elige "repaso libre".

**Modos de sesión:**
- `full`: todos los `new` + `learning`.
- `review`: solo `learning` + `review` vencidos.
- `free`: todo, incluidos `mastered`.

### 2.5. Repetición espaciada (SM-2 simplificado)

Basado en SM-2 de Anki, simplificado a `correctStreak`, `ease`,
`nextReview`.

| Evento | correctStreak | ease | nextReview |
|---|---|---|---|
| Acierto en `new` | 1 | 2.5 | mañana |
| Acierto en `learning` | +1 | +0.1 (máx 2.8) | +3 días |
| Acierto en `review` | +1 | +0.1 (máx 2.8) | `ease × intervalo` |
| Fallo | 0 | −0.2 (mín 1.3) | mañana |
| 3 aciertos seguidos | — | — | → `mastered` |

### 2.6. Reglas de diagnóstico (`errorRules`)

Cada ítem puede declarar reglas que detectan **por qué** falló el alumno.
Se prueban en orden; la **primera que matchee** gana.

**Si ninguna regla matchea:** el motor muestra feedback genérico y
guarda el tag `unclassified`. Eso también es información útil.

### 2.7. Historial y exportación

**Estructura por intento:** ver `Attempt` en `types.ts`.
**Persistencia:** localStorage, clave `ingles-a1-state-v1`.
**Exportación manual:** botón "Exportar historial para IA" genera `.txt`
con cabecera + instrucciones para IA + resumen por tag + detalle de
últimos 50 fallos.

**Importación:** el archivo que devuelve la IA se pega manualmente en
`src/content/unit-XX-reinforcement.ts`. No hay importación automática.

---

## 3. Capa 2 — El Contenido

### 3.1. Estructura de una unidad

Cada unidad es **un archivo TypeScript** en `src/content/`:

```
src/content/
├── index.ts                    // Exporta todas las unidades
├── unit-01.ts                  // Hello / Personal Introductions
├── unit-02.ts                  // My Family and Friends
├── ...
├── unit-12.ts                  // Review and Final Project
└── shared/
    ├── alphabet.ts             // Alfabeto (reutilizable)
    └── numbers-1-20.ts         // Números (reutilizable)
```

### 3.2. Tipos de ítem de práctica

El motor soporta 7 tipos, todos comparten `PracticeItemBase` con un
campo `kind` que discrimina: `match`, `multiple-choice`, `fill-blank`,
`word-order`, `listening`, `writing`, `translation`.

**`translation` es la joya** del HTML que sirvió de piloto: "Voy al
trabajo en autobús" → "I go to work by bus". Es el tipo que más se
beneficia de `errorRules`, y el que más fácil es de generar con IA.

### 3.3. Estructura pedagógica de cada unidad

1. **Objetivos** (2-5, medibles).
2. **Vocabulario**: 10-15 ítems productivos + reconocibles.
3. **Gramática**: 1-3 reglas con ejemplos bilingües.
4. **Diálogos**: 2 diálogos cortos (6-10 líneas cada uno).
5. **Práctica adaptativa**: 15-25 ítems, ordenados por dificultad (1→3).
6. **Evaluación**: 8-12 ítems, mezcla de tipos, ≥70% para aprobar.

**Reglas pedagógicas para el contenido:**
1. Un ejercicio = una competencia. No mezcles `to be` y plurales.
2. Los distractores de `multiple-choice` deben ser errores típicos de
   hispanohablantes (ej: "She are", "I is").
3. `match` máximo 4-5 pares.
4. Toda regla de gramática debe tener al menos una `errorRule`.
5. El vocabulario debe estar dentro del A1 del MCER.

### 3.4. Contenido compartido

Algunos ítems aparecen en varias unidades (alfabeto, números). Se
extraen a `src/content/shared/` y se referencian por ID.

---

## 4. Capa 3 — El Historial

### 4.1. Persistencia actual (localStorage)

Clave: `ingles-a1-state-v1`.
Formato: ver `PersistedState` en `types.ts`.

**Ventajas:** offline-first, sin backend, sin login.
**Limitaciones:** no sincroniza entre dispositivos. Aceptable por ahora.

### 4.2. Migración futura a backend (no ahora)

Cuando se agregue login, la única pieza que cambia es
`src/engine/history.ts`. El resto del motor no se entera.

**Regla:** todo acceso a persistencia pasa por `src/engine/history.ts`.

### 4.3. Loop de mejora continua

```
Alumno practica
      │
      ▼
Motor guarda Attempt[] en historial
      │
      ▼
Alumno pulsa "Exportar historial para IA"
      │
      ▼
Genera .txt con cabecera + resumen + detalle
      │
      ▼
Alumno pega el .txt a una IA
      │
      ▼
IA genera src/content/unit-XX-reinforcement.ts
      │
      ▼
Alumno pega el archivo en el repo
      │
      ▼
Alumno recarga la app → nuevos ítems entran a la cola
      │
      ▼
Vuelve al inicio
```

---

## 5. Estructura de carpetas final

```
src/
├── app/                            # Next.js App Router
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── shared/
│   └── types.ts                    # ← CONTRATO motor ↔ contenido
├── engine/                         # CAPA 1 — MOTOR
│   ├── normalize.ts
│   ├── queue.ts
│   ├── spacing.ts
│   ├── evaluate.ts
│   ├── history.ts
│   ├── speech.ts
│   └── index.ts
├── content/                        # CAPA 2 — CONTENIDO
│   ├── index.ts
│   ├── unit-01.ts
│   ├── unit-02.ts
│   ├── ...
│   └── shared/
│       ├── alphabet.ts
│       └── numbers-1-20.ts
├── hooks/
│   ├── use-progress.ts
│   ├── use-practice-session.ts
│   └── use-speech.ts
└── components/
    ├── home/
    │   └── HomeView.tsx
    ├── lesson/
    │   ├── LessonView.tsx
    │   ├── VocabularyTab.tsx
    │   ├── GrammarTab.tsx
    │   ├── DialoguesTab.tsx
    │   ├── PracticeTab.tsx
    │   ├── EvaluationTab.tsx
    │   ├── PracticeRunner.tsx
    │   ├── items/
    │   │   ├── MatchItem.tsx
    │   │   ├── MultipleChoiceItem.tsx
    │   │   ├── FillBlankItem.tsx
    │   │   ├── WordOrderItem.tsx
    │   │   ├── ListeningItem.tsx
    │   │   ├── WritingItem.tsx
    │   │   └── TranslationItem.tsx
    │   └── PronounceButton.tsx
    └── ui/
```

---

## 6. Roadmap de implementación

### Tanda 1 — Fundaciones (actual)
- [x] ARQUITECTURA.md
- [x] src/shared/types.ts
- [x] src/engine/normalize.ts + tests
- [x] vitest.config.ts
- [x] package.json (scripts de test)

### Tanda 2 — Resto del motor
- [ ] src/engine/evaluate.ts + tests
- [ ] src/engine/queue.ts + tests
- [ ] src/engine/spacing.ts + tests
- [ ] src/engine/history.ts + tests
- [ ] src/engine/index.ts (API pública)

### Tanda 3 — Piloto de integración
- [ ] src/content/unit-00-to.ts (migrado del HTML "TO")
- [ ] src/components/lesson/items/TranslationItem.tsx
- [ ] src/components/lesson/PracticeRunner.tsx
- [ ] Integración visual con la app (sin tocar la app vieja)

### Tanda 4 — Migración de Unidades 1 y 2
- [ ] src/content/unit-01.ts
- [ ] src/content/unit-02.ts
- [ ] Migrar ExerciseRunner existente a los componentes en items/

### Tanda 5 — Contenido completo A1
- [ ] Auditar PDFs restantes (unidades 3-12)
- [ ] Agregar tipos faltantes: reading, speaking
- [ ] Implementar reconocimiento de voz

### Tanda 6 — Backend (futuro)
- [ ] Login (NextAuth)
- [ ] Migrar history.ts a API remota

---

## 7. Decisiones tomadas (y por qué)

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Motor + contenido separados | Todo en course.ts | Permite reutilizar para A2, B1, otros idiomas |
| errorRules por ítem | Feedback genérico | Es el loop que ya funcionó en el HTML "TO" |
| Historial en localStorage | Backend con login | Offline-first, sin coste, migrable después |
| Exportación manual a IA | Auto-envío a API | Sin dependencia de APIs externas |
| normalize() agresivo | Comparación estricta | Evita falsos negativos por mayúsculas/puntos/apóstrofes |
| evaluation separada de practice | Una sola cola | Evita contaminar el repaso con la evaluación |
| SM-2 simplificado | Anki completo | Menos código, suficientes beneficios para A1 |
| 7 tipos de ítem | 6 actuales + translation | translation es el más útil para errorRules |

---

## 8. Glosario

- **Ítem**: unidad mínima de práctica (`PracticeItem`).
- **Unidad**: conjunto de ítems + vocabulario + gramática + diálogos.
- **Cola**: lista ordenada de ítems a presentar en una sesión.
- **ErrorRule**: regla que detecta un tipo específico de error.
- **Tag**: etiqueta que agrupa ítems por tema (ej: `to-verb`).
- **Intento**: registro de una respuesta del alumno (`Attempt`).
- **SM-2**: algoritmo de repetición espaciada.
- **MCER**: Marco Común Europeo de Referencia.

---

*Fin del documento. Cualquier cambio a la arquitectura requiere
actualizar este archivo y bumpear la versión.*
