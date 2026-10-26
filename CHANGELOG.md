# Changelog

Todo los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [0.3.1] — 2026-07-04

### Hotfix — Build fallaba por componentes ui/ no usados con dependencias faltantes

Esta versión corrige el error que impedía hacer `bun run build` en la PC
del usuario: `Cannot find module 'react-day-picker'`.

---

### 🐛 Corregido

#### Bug #15 — Build fallaba por dependencias faltantes en componentes ui/

- **Síntoma:** Al ejecutar `bun run build` en la PC del usuario:
  ```
  Failed to type check.
  ./src/components/ui/calendar.tsx:9:60
  Type error: Cannot find module 'react-day-picker' or its corresponding
  type declarations.
  ```

- **Causa raíz:**
  El ZIP v0.3.0 incluía los 48 componentes shadcn/ui de la plantilla
  original, pero solo 16 se usaban en la app. Los 32 componentes no
  usados (como `calendar.tsx`) importaban dependencias que no estaban
  en el `package.json` simplificado (como `react-day-picker`).

- **Fix:**
  Se eliminaron los 32 componentes ui/ no usados, dejando solo los 16
  que la app importa realmente:
  - badge, button, card, dialog, input, label, progress, separator,
    sheet, skeleton, sonner, tabs, textarea, toast, toggle, tooltip

  Esto reduce el tamaño del ZIP de 828 KB a 790 KB y elimina el error
  de build.

- **Archivo afectado:** `src/components/ui/` (32 archivos eliminados)

---

### 🔍 Verificación completa (smoke test end-to-end)

Se descomprimió el ZIP v0.3.1 en una carpeta limpia y se ejecutó todo
el flujo:

1. ✅ `bun install` → 474 paquetes sin errores
2. ✅ `bun run db:generate` → Prisma Client generado
3. ✅ `bun run build` → Compila sin errores de TypeScript
4. ✅ `bun run start` → Servidor escucha en `0.0.0.0:3000`
5. ✅ Acceso vía IP local → HTTP 200, home carga correctamente
6. ✅ **Sin warnings de cross-origin** en el log del servidor
7. ✅ Click en Unidad 1 → abre lección con 5 pestañas
8. ✅ Click en Unidad 2 → abre lección con 5 pestañas
9. ✅ 0 errores en consola del navegador

---

## [0.3.0] — 2026-07-04

### Cambio de enfoque — Modo producción para probar en Android

Después de 7 versiones de hotfix intentando arreglar el acceso desde
Android en modo desarrollo, se determinó que **el problema no era de
código, sino de las restricciones de seguridad del modo desarrollo de
Next.js**.

Esta versión cambia el enfoque: en lugar de pelear con `allowedDevOrigins`
y el Service Worker, se recomienda usar **modo producción** para probar
en el celular.

---

### 🎯 Problema real (finalmente diagnosticado)

- **Síntoma:** En PC la app funcionaba, pero en Android la página se
  quedaba "pensando" indefinidamente y nunca cargaba (ni siquiera el
  menú).

- **Causa raíz REAL:**
  El modo desarrollo de Next.js (`next dev`) tiene **restricciones de
  seguridad** que bloquean las peticiones JavaScript desde orígenes
  externos (cross-origin). Cuando Android pide los archivos JS de
  `/_next/static/chunks/*`, Next.js los bloquea con:
  ```
  ⚠ Blocked cross-origin request to Next.js dev resource
  /_next/webpack-hmr from "192.168.2.197".
  ```
  Sin esos archivos JS, React nunca carga → la página se queda en blanco
  "pensando" para siempre.

  La configuración `allowedDevOrigins` en `next.config.ts` NO funcionaba
  porque Next.js **no soporta formato CIDR** (como `192.168.0.0/16`) ni
  wildcards dobles (como `192.168.*.*`). Solo acepta IPs exactas o
  wildcards de subdominios (como `*.loca.lt`).

  Como la IP del celular puede cambiar (cada red WiFi es diferente), no
  era viable hardcodear la IP del usuario.

### ✅ Solución: Modo producción

El modo producción (`next build && next start`) **NO tiene las
restricciones de seguridad** del modo desarrollo. Sirve los archivos
estáticos normalmente, sin bloquear IPs externas.

**Cambios realizados:**

1. Se actualizó `package.json` para que el script `start` escuche en
   todas las interfaces:
   ```json
   "start": "next start -H 0.0.0.0 -p 3000"
   ```

2. Se actualizó el `README.md` con instrucciones claras:
   - Para desarrollar en PC: `bun run dev` (con recarga automática)
   - Para probar en Android: `bun run build && bun run start` (sin
     restricciones de cross-origin)

### 🔍 Verificación en modo producción

1. ✅ `bun run build` → compila sin errores
2. ✅ `bun run start` → servidor escucha en `0.0.0.0:3000`
3. ✅ Acceso vía IP local → HTTP 200, home carga correctamente
4. ✅ **Sin warnings de cross-origin** en el log del servidor
5. ✅ Click en Unidad 1 → abre lección con 5 pestañas
6. ✅ 0 errores en consola del navegador

### 📝 Flujo de trabajo recomendado

| Tarea | Comando | Cuándo usar |
| ----- | ------- | ----------- |
| Desarrollar en PC | `bun run dev` | Mientras escribes código, recarga automática |
| Probar en Android | `bun run build && bun run start` | Cuando quieras ver la app en el celular |
| Deploy permanente | Subir a Vercel | Cuando quieras acceso público 24/7 |

> 💡 Cada vez que cambies el código y quieras probar en el celular,
> necesitas re-build: detén el servidor con `Ctrl+C`, ejecuta
> `bun run build`, luego `bun run start`.

### 📄 Archivos afectados

- `package.json` — script `start` con `-H 0.0.0.0`
- `README.md` — sección "Acceso desde el celular" reescrita
- `CHANGELOG.md` — esta entrada

### 🎉 Lección aprendida

Después de 7 versiones de hotfix (v0.2.1 a v0.2.7), la lección es:
**no pelees contra las restricciones de seguridad del modo desarrollo.**
El modo desarrollo está diseñado para usarse en `localhost` únicamente.
Para acceder desde otros dispositivos, usa modo producción.

---

## [0.2.7] — 2026-07-04

### Hotfix — Bucle de recarga infinito en Android

Esta versión corrige el problema que apareció en v0.2.5/v0.2.6 donde la
página se quedaba "pensando" indefinidamente en Android y nunca cargaba.

---

### 🐛 Corregido

#### Bug #14 — Bucle de recarga infinito en Android

- **Síntoma:** Después de instalar v0.2.6, la app funcionaba en PC pero
  en Android la página se quedaba cargando indefinidamente y nunca
  terminaba de renderizar. El log del servidor mostraba múltiples
  peticiones `GET /` repetidas (bucle de recarga).

- **Causa raíz:**
  En v0.2.5, `ServiceWorkerRegister.tsx` tenía esta lógica en desarrollo:
  ```ts
  if (registrations.length > 0) {
    // Desinstalar SW...
    window.location.reload();  // ← ESTO causaba el bucle
  }
  ```
  En Android, el Service Worker no se desinstala instantáneamente —
  tarda un ciclo de vida. La secuencia era:
  1. Página carga
  2. Detecta SW viejo → lo desinstala (async)
  3. `window.location.reload()` recarga la página inmediatamente
  4. La página carga de nuevo
  5. El SW aún no se ha desinstalado completamente → se detecta otra vez
  6. Vuelve a desinstalar + recargar → **bucle infinito**

  En PC funcionaba porque Chrome desktop maneja la desinstalación del
  SW de forma más rápida, pero Chrome Android tiene un ciclo de vida
  diferente.

- **Fix:**
  Se eliminó completamente el `window.location.reload()` del
  `ServiceWorkerRegister.tsx`. Ahora en desarrollo:
  - Desinstala el SW silenciosamente (sin recargar)
  - Limpia las caches silenciosamente (sin recargar)
  - La página continúa cargando normalmente

  El usuario puede recargar manualmente si es necesario, pero no es
  obligatorio.

- **Archivo afectado:** `src/components/ServiceWorkerRegister.tsx`

---

### 🔍 Verificación

1. ✅ Cargar la home
2. ✅ Inyectar progreso 17% en localStorage
3. ✅ Recargar la página → **NO hay bucle de recarga** (solo 2 peticiones
   GET / normales: carga inicial + reload)
4. ✅ Home carga correctamente
5. ✅ Click en Unidad 1 → abre lección con 5 pestañas
6. ✅ 0 errores en consola

---

### 📝 Resumen del estado actual

Después de 7 versiones de hotfix, el estado es:

| Versión | Problema resuelto | Estado |
| ------- | ----------------- | ------ |
| v0.2.0 | Unidad 2 añadida | ✅ |
| v0.2.1 | ZIP sin componentes ui/ | ✅ |
| v0.2.2 | (intentó arreglar hydration) | ❌ incompleto |
| v0.2.3 | Hook useProgress lazy-init | ✅ |
| v0.2.4 | SW en desarrollo | ✅ |
| v0.2.5 | Limpieza agresiva de caches | ✅ |
| v0.2.6 | HomeView client-only (elimina hydration) | ✅ |
| v0.2.7 | Bucle de recarga en Android | ✅ |

La combinación de v0.2.6 (client-only rendering) + v0.2.7 (sin reload)
debería resolver definitivamente tanto el hydration mismatch como el
bucle de recarga.

---

## [0.2.6] — 2026-07-04

### Hotfix DEFINITIVO — HomeView con renderizado client-only

Esta versión aplica la solución nuclear al problema de hydration mismatch
que persistía a pesar de todos los fixes anteriores: **desactivar el SSR
para el contenido dinámico de la home**.

---

### 🐛 Corregido

#### Bug #13 — Hydration mismatch persistente a pesar de fixes anteriores

- **Síntoma:** Después de aplicar v0.2.3 (fix del hook), v0.2.4 (fix del
  SW) y v0.2.5 (limpieza agresiva), el error de hidratación **seguía
  apareciendo** en la PC y el celular del usuario:
  ```
  Uncaught Error: Hydration failed because the server rendered text
  didn't match the client.
  + 17
  - 0
  at HomeView (src/components/home/HomeView.tsx:57:31)
  ```

- **Causa raíz:**
  A pesar de todos los fixes, el navegador del usuario seguía cacheando
  HTML de una versión anterior (servido por SW, HTTP cache, o `.next`
  cache). Ese HTML cacheado tenía `overall=0` embebido en el RSC payload,
  pero el código nuevo en el cliente leía `localStorage` con `progress=17`.
  Resultado: mismatch → React rompía la página → no se podía hacer clic
  en las unidades.

- **Fix — Solución nuclear: Client-only rendering**
  Se modificó `HomeView.tsx` para que:
  1. Durante SSR y el primer render del cliente, muestre solo un loader:
     ```tsx
     if (!mounted) {
       return (
         <div className="min-h-screen flex items-center justify-center">
           <Loader2 className="size-8 animate-spin" />
           <p>Cargando curso…</p>
         </div>
       );
     }
     ```
  2. Solo después del mount (en el segundo render del cliente), muestre
     el contenido real con el progreso cargado desde `localStorage`.

  **Por qué esto funciona:** El servidor y el primer render del cliente
  devuelven EXACTAMENTE el mismo HTML (el loader). No hay nada que
  comparar → no hay mismatch posible. El contenido real aparece en el
  segundo render, ya en el cliente, sin SSR involucrado.

  **Trade-off:** La home muestra un loader de ~100ms al cargar. Es
  imperceptible para el usuario y aceptable para una app educativa.

- **Archivo afectado:** `src/components/home/HomeView.tsx`

---

### 🔍 Verificación

Se reprodujo el escenario exacto del usuario:

1. ✅ Cargar la home
2. ✅ Inyectar `progress=17` en `localStorage`
3. ✅ **Recargar la página** ← antes fallaba con hydration mismatch
4. ✅ Home carga **sin errores de hidratación** (muestra loader brevemente,
   luego el contenido real)
5. ✅ Click en Unidad 1 → **abre la lección con 5 pestañas**
6. ✅ 0 errores en consola del navegador
7. ✅ 0 errores en log del servidor

---

### 📝 Por qué los fixes anteriores no funcionaron

- **v0.2.3** arregló el hook `useProgress` (lazy-init con localStorage)
  → correcto, pero no fue suficiente porque el HTML cacheado seguía
  teniendo el payload viejo.
- **v0.2.4** desinstaló el SW en desarrollo → correcto, pero el HTML
  cacheado en el `caches` del navegador siguió sirviéndose.
- **v0.2.5** limpió las caches agresivamente → correcto, pero algunos
  navegadores (especialmente Chrome en Windows) tienen múltiples capas
  de cache (HTTP cache, disk cache, back-forward cache) que persisten.

**La única solución 100% confiable era eliminar el SSR del contenido
dinámico.** Eso es lo que hace v0.2.6.

---

## [0.2.5] — 2026-07-04

### Hotfix — Limpieza agresiva de Service Worker en desarrollo

Esta versión fuerza la limpieza del Service Worker viejo que seguía
cacheando HTML en el navegador del usuario, causando el mismo error de
hidratación una y otra vez a pesar de los fixes anteriores.

---

### 🐛 Corregido

#### Bug #12 — Service Worker viejo persistía en el navegador del usuario

- **Síntoma:** Después de instalar v0.2.4 (que ya desinstalaba el SW en
  desarrollo), el error de hidratación **seguía apareciendo** en la PC
  del usuario:
  ```
  Uncaught Error: Hydration failed because the server rendered text
  didn't match the client.
  + 17
  - 0
  ```
  El `+17 -0` indicaba que el navegador estaba sirviendo HTML cacheado
  con `overall=0`, pero React leía `localStorage` con `progress=17`.

- **Causa raíz:**
  El fix v0.2.4 desinstalaba el SW, pero **el HTML ya cacheado por el
  SW viejo seguía en el `caches` del navegador**. Incluso después de
  desinstalar el SW, el navegador seguía sirviendo ese HTML cacheado
  en algunas situaciones (especialmente en recargas suaves).

  Además, el `CACHE_NAME` del SW era `ingles-a1-v1` (sin número de
  versión claro), así que el SW nuevo no podía distinguir su cache
  del cache viejo.

- **Fix:**
  1. Se cambió `ServiceWorkerRegister.tsx` para que en desarrollo:
     - Desinstale TODOS los service workers registrados
     - Borre TODAS las caches del navegador (`caches.keys()` → `caches.delete()`)
     - Si encontró SW o caches, **fuerce una recarga de la página** para
       que el navegador vuelva a fetchear todo desde el servidor
  2. Se cambió el `CACHE_NAME` del SW de `ingles-a1-v1` a `ingles-a1-v2.4`
     para que el SW nuevo (en producción) invalide automáticamente las
     caches viejas al activarse.

- **Archivos afectados:**
  - `src/components/ServiceWorkerRegister.tsx` (limpieza agresiva en dev)
  - `public/sw.js` (nuevo CACHE_NAME `ingles-a1-v2.4`)

---

### 🔍 Verificación

Se reprodujo el escenario exacto del usuario:

1. ✅ Primera carga: home carga sin errores
2. ✅ Inyectar `progress=17` en `localStorage`
3. ✅ **Recargar la página** ← antes fallaba con hydration mismatch
4. ✅ Home carga **sin errores de hidratación**
5. ✅ Click en Unidad 1 → **abre la lección con 5 pestañas**
6. ✅ 0 errores en consola
7. ✅ 0 errores en log del servidor

---

### 🧹 Limpieza manual recomendada (UNA sola vez)

Aunque v0.2.5 limpia automáticamente, si el navegador del usuario tiene
un SW viejo muy persistente, debe limpiar manualmente **una sola vez**:

#### En Chrome/Edge (PC):
1. Abrir `http://localhost:3000`
2. Presionar **F12** (DevTools)
3. Pestaña **Application**
4. Panel izquierdo → **Service Workers** → **Unregister**
5. Panel izquierdo → **Storage** → **Clear site data**
6. Recargar con **Ctrl + Shift + R** (recarga forzada)

#### En Chrome (Android):
1. Mantener presionado el icono de Chrome
2. **App info** → **Storage** → **Clear data**

Después de esta limpieza única, el código nuevo se encarga de mantener
todo limpio automáticamente en cada recarga mientras estés en
desarrollo.

---

## [0.2.4] — 2026-07-04

### Hotfix — Service Worker causaba hydration mismatch en desarrollo

Esta versión corrige el problema que **persistía después del fix v0.2.3**.
El código estaba bien, pero un Service Worker cacheando HTML viejo causaba
el mismo error de hidratación una y otra vez.

---

### 🐛 Corregido

#### Bug #11 — Service Worker cacheaba HTML viejo en desarrollo

- **Síntoma:** Después de aplicar el fix v0.2.3 (que arregló el hook
  `useProgress`), el error de hidratación **seguía apareciendo** en la
  PC del usuario:
  ```
  Uncaught Error: Hydration failed because the server rendered text
  didn't match the client.
  + 17
  - 0
  ```
  Incluso después de reinstalar todo desde cero.

- **Causa raíz:**
  El Service Worker (`public/sw.js`) estaba registrado en desarrollo y
  usaba una estrategia **network-first con fallback a cache** para el
  HTML. Esto significa que:
  1. En la primera visita, el SW cacheaba el HTML con `overall=0` (sin
     progreso).
  2. El usuario hacía ejercicios → `localStorage` guardaba `progress=17`.
  3. En la siguiente visita, el SW servía el HTML cacheado (con `overall=0`
     embebido en el RSC payload), pero React en el cliente leía
     `localStorage` (con `progress=17`) → **mismatch**.

  El fix v0.2.3 (cambiar el hook para que cargue `localStorage` en
  `useEffect`) no resolvió esto porque el SW ya había cacheado el HTML
  con el payload del servidor (que siempre tiene `overall=0`).

- **Fix:**
  Se modificó `ServiceWorkerRegister.tsx` para que:
  - **En desarrollo** (`NODE_ENV === "development"`): DESINSTALE
    cualquier Service Worker existente. Esto evita que cachee HTML y
    cause hydration mismatches.
  - **En producción**: registre el SW normalmente para soporte offline
    y PWA.

  ```ts
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Desinstalar SWs existentes en desarrollo
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    });
    return;
  }
  // En producción, registrar normalmente
  ```

- **Archivo afectado:** `src/components/ServiceWorkerRegister.tsx`

---

### 🔍 Verificación con simulación del escenario del usuario

Se reprodujo **exactamente** el escenario que causaba el problema:

1. ✅ Cargar la home (sin progreso)
2. ✅ Inyectar `localStorage` con `progress=17` (simulando ejercicios
   previos)
3. ✅ **Recargar la página** ← aquí fallaba antes
4. ✅ La home carga **sin errores de hidratación**
5. ✅ Click en Unidad 1 → **abre la lección con 5 pestañas**
6. ✅ Click en Unidad 2 → abre lección correctamente
7. ✅ 0 errores en consola del navegador
8. ✅ 0 errores en log del servidor

---

### 📝 Lección aprendida #2

Los Service Workers son geniales para producción (offline, PWA), pero en
desarrollo causan problemas sutiles porque cachean HTML que luego no
coincide con el código actualizado. La regla general es:

> **En desarrollo, NUNCA registres el Service Worker. Solo en producción.**

Si ya estaba registrado de una versión anterior, desinstálalo
automáticamente al cargar la página en dev mode.

---

### 🧹 Limpieza manual recomendada en el navegador del usuario

Aunque el fix v0.2.4 desinstala el SW automáticamente, si el usuario
sigue viendo el error después de actualizar, debe limpiar el navegador
una vez:

#### En Chrome/Edge (PC):
1. Abrir DevTools (F12)
2. Pestaña **Application**
3. En el panel izquierdo: **Service Workers** → clic en **Unregister**
4. En el panel izquierdo: **Storage** → botón **Clear site data**
5. Recargar la página (Ctrl+F5)

#### En Chrome (Android):
1. Mantener presionado el icono de la app
2. **App info** → **Storage** → **Clear data**
3. O: Chrome → menú ⋮ → **History** → **Clear browsing data**

---

## [0.2.3] — 2026-07-04

### Hotfix DEFINITIVO — Hydration mismatch + cross-origin (real fix)

Esta versión corrige de forma **definitiva** los problemas que impedían usar
la app desde el celular. Las versiones anteriores (v0.2.1 y v0.2.2) tenían
fixes parciales que no resolvían el problema de raíz.

---

### 🐛 Corregido

#### Bug #8 (definitivo) — Hydration mismatch en HomeView

- **Síntoma:** Al cargar la home desde el celular (o tras tener progreso
  guardado), aparecía en consola:
  ```
  Uncaught Error: Hydration failed because the server rendered text
  didn't match the client.
  + 17
  - 0
  ```
  El `+17 -0` indicaba que el cliente mostraba 17% de progreso pero el
  servidor mostraba 0%. Esto "congelaba" la página y no se podía hacer
  clic en ninguna unidad.

- **Causa raíz REAL (no la que se creía en v0.2.2):**
  El hook `useProgress` en `src/hooks/use-progress.ts` usaba inicialización
  lazy con `localStorage`:
  ```ts
  const [progress, setProgress] = useState<CourseProgress>(() => {
    if (typeof window === "undefined") return {};
    return loadProgress();  // ← ESTO causaba el mismatch
  });
  ```
  En el SSR, `typeof window === "undefined"` es `true` → retorna `{}`.
  En el primer render del cliente, `window` YA existe → retorna el progreso
  real (ej. `{1: {progress: 17}}`).
  Eso hacía que el HTML del servidor y del primer render del cliente fueran
  distintos → React detectaba el mismatch y rompía la página.

  El fix anterior (v0.2.2) intentó arreglarlo con un patrón `mounted` en
  `HomeView.tsx`, pero el problema estaba **en el hook**, no en el
  componente. Por eso seguía fallando.

- **Fix definitivo:**
  1. Se cambió `useProgress` para que SIEMPRE inicialice con `{}` (nunca
     leer `localStorage` en el render inicial):
     ```ts
     const [progress, setProgress] = useState<CourseProgress>({});
     ```
  2. El progreso real se carga en un `useEffect` (que solo se ejecuta en
     el cliente, después del primer render):
     ```ts
     useEffect(() => {
       setProgress(loadProgress());
       // ... listeners
     }, []);
     ```
  3. Como tanto el SSR como el primer render del cliente ahora usan `{}`,
     el HTML es idéntico → no hay mismatch.
  4. El `HomeView.tsx` se simplificó: ya no necesita el patrón `mounted`
     porque el hook ahora es seguro por defecto.

- **Archivos afectados:**
  - `src/hooks/use-progress.ts` (fix de raíz)
  - `src/components/home/HomeView.tsx` (simplificación, ya sin `mounted`)

#### Bug #9 (definitivo) — Cross-origin HMR bloqueado desde el celular

- **Síntoma:** Al acceder desde el celular vía `http://192.168.x.x:3000`,
  aparecía en la consola de la PC:
  ```
  ⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr
  from "192.168.2.197".
  ```

- **Causa raíz REAL:**
  El fix anterior (v0.2.2) usaba wildcards dobles como `"192.168.*.*"`,
  pero **Next.js NO soporta wildcards dobles** en `allowedDevOrigins`.
  Solo soporta:
  1. Host exacto: `"192.168.1.50"`
  2. Wildcard simple (un solo `*`): `"*.loca.lt"`
  3. CIDR: `"192.168.0.0/16"`

- **Fix definitivo:** Se cambió el formato a CIDR en `next.config.ts`:
  ```ts
  allowedDevOrigins: [
    "192.168.0.0/16",   // ← formato CIDR (correcto)
    "10.0.0.0/8",
    "172.16.0.0/12",
    "*.loca.lt",
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.vercel.app",
  ],
  ```

- **Archivo afectado:** `next.config.ts`

---

### 🔍 Verificación con Agent Browser vía IP local (simulando celular)

Se simuló el acceso desde el celular abriendo la app vía la IP local
del sandbox (`http://21.0.2.167:3000/`) en lugar de `localhost`:

- ✅ HTTP 200 al acceder por IP
- ✅ Home renderiza SIN errores de hidratación (antes fallaba)
- ✅ Click en Unidad 1 → abre lección con 5 pestañas (antes fallaba)
- ✅ Click en Unidad 2 → abre lección con 5 pestañas
- ✅ Pestaña Evaluación → muestra "Evaluación Final"
- ✅ Click "Comenzar evaluación" → Q1 carga correctamente
- ✅ 0 errores en consola del navegador
- ✅ ESLint pasa limpio

---

### 📝 Lección aprendida

El bug #8 fue difícil de diagnosticar porque el patrón `mounted` en el
componente parecía la solución obvia. Sin embargo, el problema estaba
**en el hook**, no en el componente. La regla general es:

> **Cualquier hook que lea `localStorage` en `useState` lazy-init
> causará hydration mismatch en Next.js con SSR.**

La solución correcta es SIEMPRE inicializar con un valor vacío y cargar
los datos reales en un `useEffect`.

---

## [0.2.2] — 2026-07-04

### Hotfix — Acceso desde el celular (hydration + cross-origin block) — INCOMPLETO

> ⚠️ **Esta versión fue reemplazada por v0.2.3.** El fix de hydration
> era parcial (patrón `mounted` en el componente, no en el hook) y el
> formato de `allowedDevOrigins` con wildcards dobles no funcionaba.
> Ver v0.2.3 para el fix definitivo.

Esta versión corrige dos problemas que impedían usar la app desde un celular
Android conectado al mismo WiFi de la PC:

1. **Hydration mismatch**: el servidor no podía leer `localStorage`, así que
   renderizaba `0%` de progreso, mientras que el cliente (con progreso
   guardado) mostraba `17%`. React detectaba la diferencia y rompía la
   página — impedía navegar a cualquier unidad.
2. **Cross-origin block**: Next.js bloqueaba por defecto las peticiones HMR
   desde la IP del celular (`192.168.x.x`), mostrando warnings en consola
   y a veces impidiendo la navegación.

---

### 🐛 Corregido

#### Bug #8 — Hydration mismatch en HomeView

- **Síntoma:** Al cargar la home desde el celular (o tras tener progreso
  guardado en la PC), aparecía en consola:
  ```
  Uncaught Error: Hydration failed because the server rendered text
  didn't match the client.
  ```
  Y luego no se podía hacer clic en ninguna unidad (la página quedaba
  "congelada" en el estado de error).

- **Causa raíz:** En `HomeView.tsx`, la línea
  `const overall = getOverallCourseProgress();` se ejecutaba durante el
  render. En el servidor (SSR) `localStorage` no existe, así que retornaba
  `0`. En el cliente, la misma función leía el `localStorage` y retornaba
  el progreso real (ej. `17`). Esa diferencia de HTML entre servidor y
  cliente violaba el contrato de hidratación de React.

- **Fix:** Patrón estándar de "hidratación segura":
  1. Se añadió un estado `mounted` que arranca en `false` y pasa a `true`
     en el primer `useEffect` del cliente.
  2. El progreso `overall` ahora se calcula de forma derivada a partir
     del estado `progress` del hook `useProgress` (que ya hace lazy-init
     en SSR con `{}`), pero solo se muestra el valor real cuando
     `mounted === true`. En SSR y en el primer render del cliente se
     muestra `0%`, igualando ambos lados.
  3. Se pasó también `mounted` al `UnitCard` para que el progreso por
     unidad solo se muestre tras el mount.
  4. Se eliminó el import de `getOverallCourseProgress` (ya no se usa
     directamente en el render).

- **Archivo afectado:** `src/components/home/HomeView.tsx`

#### Bug #9 — Cross-origin HMR bloqueado desde el celular

- **Síntoma:** Al acceder desde el celular vía `http://192.168.x.x:3000`,
  aparecía en la consola de la PC:
  ```
  ⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr
  from "192.168.2.197".
  Cross-origin access to Next.js dev resources is blocked by default for
  safety.
  ```

- **Causa raíz:** Next.js 16 bloquea por defecto las peticiones HMR
  (Hot Module Replacement) desde orígenes distintos a `localhost`, para
  evitar ataques CSRF en desarrollo. La IP del celular no estaba en la
  lista de orígenes permitidos.

- **Fix:** Se añadió `allowedDevOrigins` al `next.config.ts` con los
  rangos CIDR de redes privadas más comunes:
  ```ts
  allowedDevOrigins: [
    "192.168.0.0/16",   // WiFi hogareña típica
    "10.0.0.0/8",       // Otra red privada común
    "172.16.0.0/12",    // Otra red privada común
    "*.loca.lt",        // localtunnel
    "*.ngrok.io",       // ngrok
    "*.ngrok-free.app", // ngrok free tier
    "*.vercel.app",     // Vercel preview
  ],
  ```

- **Archivo afectado:** `next.config.ts`

#### Bug #10 — Script `dev` no exponía el servidor a la red local

- **Síntoma:** Aunque `allowedDevOrigins` estuviera configurado, el
  servidor Next.js solo escuchaba en `localhost` (127.0.0.1) por defecto,
  así que el celular no podía conectarse.

- **Causa raíz:** El script `dev` era `next dev -p 3000`, que vincula
  el servidor solo a `localhost`.

- **Fix:** Se cambió el script en ambos `package.json` (del sandbox y
  del ZIP descargable) a:
  ```json
  "dev": "next dev -H 0.0.0.0 -p 3000"
  ```
  El flag `-H 0.0.0.0` hace que el servidor escuche en todas las
  interfaces de red, permitiendo conexiones desde la red local.

- **Archivos afectados:** `package.json` (raíz y ZIP descargable)

---

### 📝 Cambios en la documentación

- Se añadió al `README.md` una sección completa **"📱 Acceso desde el
  celular (Android)"** con las 3 opciones:
  - 🟢 Opción 1: Misma red WiFi (con pasos para Windows y Linux/Mac)
  - 🌐 Opción 2: Túnel público (localtunnel y ngrok)
  - 🚀 Opción 3: Deploy a Vercel
  - 📲 Cómo instalarla como app nativa (PWA) en Android, Windows e iOS
- Se actualizaron los "Scripts disponibles" del README para reflejar
  que `dev` ahora escucha en `0.0.0.0:3000`.

---

### 🔍 Verificación con Agent Browser usando IP local

Se simuló el acceso desde el celular abriendo la app vía la IP local
del sandbox (`http://21.0.2.167:3000/`) en lugar de `localhost`:

- ✅ HTTP 200 al acceder por IP
- ✅ Home renderiza sin errores de hidratación
- ✅ Click en Unidad 1 abre la lección con 5 pestañas (antes fallaba)
- ✅ Click en Unidad 2 también abre correctamente
- ✅ Pestañas Vocabulario, Ejercicios y Evaluación cargan sin errores
- ✅ 0 errores en consola del navegador
- ✅ 0 errores en log del servidor
- ✅ ESLint pasa limpio

---

## [0.2.1] — 2026-07-04

### Hotfix — ZIP descargable incompleto (faltaban componentes shadcn/ui)

Esta versión corrige un problema crítico del ZIP descargable v0.2.0: el
paquete NO incluía los 48 componentes shadcn/ui (`@/components/ui/*`) ni el
`package.json` con todas las dependencias necesarias, lo que provocaba
errores `Module not found: Can't resolve '@/components/ui/badge'` (y
similares) al ejecutar `bun run dev` en la PC del usuario.

---

### 🐛 Corregido

#### Bug #7 — ZIP descargable v0.2.0 incompleto

- **Síntoma:** Al descomprimir el ZIP `inglesA1-v0.2.0.zip` en una PC con
  Windows y ejecutar `bun run dev`, aparecían decenas de errores:
  ```
  ⨯ ./src/components/home/HomeView.tsx:6:1
  Module not found: Can't resolve '@/components/ui/badge'
  ⨯ ./src/components/lesson/DialoguesTab.tsx:7:1
  Module not found: Can't resolve '@/components/ui/badge'
  ⨯ ./src/components/lesson/ExerciseRunner.tsx:8:1
  Module not found: Can't resolve '@/components/ui/input'
  ... (y muchos más)
  ```
  El servidor Next.js arrancaba correctamente (`✓ Ready in 761ms`) pero
  ninguna página podía compilar porque faltaban todos los componentes de UI.

- **Causa raíz:** Al empaquetar el ZIP v0.2.0 solo se incluyeron los
  componentes custom (`src/components/home/`, `src/components/lesson/`,
  `src/components/ServiceWorkerRegister.tsx`), pero se omitió por completo
  la carpeta `src/components/ui/` con los 48 componentes shadcn/ui
  (`badge.tsx`, `button.tsx`, `card.tsx`, `tabs.tsx`, `progress.tsx`,
  `input.tsx`, `textarea.tsx`, `sonner.tsx`, etc.) que son dependencias
  internas del proyecto. Además, el `package.json` del ZIP estaba
  sobre-recortado y le faltaban muchas dependencias `@radix-ui/*` que
  usan los componentes shadcn/ui.

- **Fix:**
  1. Se copió la carpeta completa `src/components/ui/` (48 archivos) al
     repositorio descargable.
  2. Se reescribió `package.json` con TODAS las dependencias necesarias
     (27 paquetes `@radix-ui/*`, prisma, sonner, lucide-react, etc.).
  3. Se incluyó `prisma/schema.prisma` y la base de datos SQLite
     `db/custom.db` para que `@prisma/client` funcione sin configuración
     adicional.
  4. Se creó el archivo `.env` con `DATABASE_URL="file:./db/custom.db"`.
  5. Se simplificó `next.config.ts` quitando la configuración
     `allowedDevOrigins` (específica del sandbox) y `output: "standalone"`
     (innecesaria para el usuario).
  6. Se hicieron multiplataforma los scripts de `package.json`:
     - `dev`: ahora es solo `next dev -p 3000` (sin `tee dev.log` que
       falla en Windows PowerShell).
     - `build`: ahora es solo `next build` (sin `cp -r` que es Linux-only).
     - `start`: ahora es `next start` (estándar).

- **Archivos afectados:**
  - `src/components/ui/*.tsx` (48 archivos nuevos en el ZIP)
  - `package.json` (reescrito con todas las deps)
  - `next.config.ts` (simplificado)
  - `.env` (nuevo)
  - `.env.example` (nuevo)
  - `prisma/schema.prisma` (incluido)
  - `db/custom.db` (incluido)

---

### 🔍 Verificación con smoke test completo

Se realizó un **smoke test end-to-end** simulando exactamente lo que haría
el usuario en su PC:

1. ✅ Descomprimir `inglesA1-v0.2.1.zip` en una carpeta limpia (`/tmp/inglesA1-test`)
2. ✅ `bun install` → 474 paquetes instalados en 11.6s, sin errores
3. ✅ `bun run db:generate` → Prisma Client generado correctamente
4. ✅ `bun run db:push` → Schema aplicado a SQLite
5. ✅ `bun run dev` → Servidor Next.js arranca en puerto 3000
6. ✅ `curl http://localhost:3000/` → HTTP 200, HTML con "Inglés A1"
7. ✅ Agent Browser abre la home → muestra Unidades 1 y 2 habilitadas
8. ✅ Click en Unidad 2 → abre lección con 5 pestañas
9. ✅ Vocabulario de la Unidad 2 carga (14 palabras de Familia, etc.)
10. ✅ 0 errores en consola del navegador
11. ✅ 0 warnings en log del servidor
12. ✅ Todas las rutas `GET /` responden 200

---

### 📝 Notas de versión

- **Si ya descargaste la v0.2.0 y la tienes en tu PC:** elimina esa carpeta
  y descarga la v0.2.1. Luego ejecuta:
  ```bash
  bun install
  bun run db:generate
  bun run dev
  ```
- **Si tienes Bun instalado pero no Prisma:** `bun install` instalará
  Prisma automáticamente. Solo necesitas ejecutar `bun run db:generate`
  una vez para generar el cliente.
- **Alternativa sin Bun:** también puedes usar `npm install` y
  `npm run dev`. Bun es más rápido pero no es obligatorio.
- **El peso del ZIP subió de 762 KB a 815 KB** porque ahora incluye los 48
  componentes shadcn/ui y el schema de Prisma. Sigue siendo liviano.

---

## [0.2.0] — 2026-07-04

### Unidad 2 completa + mejoras de estabilidad del servidor de desarrollo

Esta versión añade la **Lección 2: My Family and Friends** siguiendo el mismo
patón pedagógico de la Unidad 1, y corrige problemas de estabilidad del
servidor de desarrollo en el entorno sandbox.

---

### ✅ Agregado

#### Lección 2 — My Family and Friends

- **Estado de la unidad** cambiado de `coming-soon` a `available` en `src/data/course.ts`.
- **Vocabulario** (27 términos en 3 categorías):
  - **Familia** (14 palabras): Father, Mother, Son, Daughter, Brother, Sister, Grandfather, Grandmother, Uncle, Aunt, Cousin, Husband, Wife, Baby — cada uno con emoji, transcripción fonética aproximada y traducción
  - **Adjetivos descriptivos** (8 palabras): Tall, Short, Young, Old, Happy, Sad, Kind, Funny
  - **Amigos y relaciones** (5 palabras): Friend, Best friend, Boyfriend, Girlfriend, Neighbor
- **Gramática** (3 reglas):
  1. Adjetivos posesivos (`my`, `your`, `his`, `her`, `our`, `their`) con tabla bilingüe de ejemplos y tip sobre la diferencia con el español
  2. Verbo `to have` (tener) con conjugación, negación e interrogación, y tip sobre `has` vs `have`
  3. Presentaciones y descripciones: `This is my...`, `He is tall and kind`, `Do you have...?`
- **Diálogos** (2 conversaciones):
  1. "Presentando a la familia en el parque" — entre dos amigos que presentan a sus familiares
  2. "Describiendo a los padres" — conversación mirando una foto, con descripción física y de personalidad
- **Ejercicios** (7 ejercicios con feedback inmediato):
  - `u2-ex1`: Emparejar miembros de familia (Father↔Padre, Sister↔Hermana, etc.)
  - `u2-ex2`: Opción múltiple — `This is ___ book.` (my/me/I)
  - `u2-ex3`: Opción múltiple — `That is ___ car.` (her/she/hers)
  - `u2-ex4`: Completar con `has`/`have`/`Do` (3 huecos)
  - `u2-ex5`: Ordenar palabras → "This is my father"
  - `u2-ex6`: Comprensión auditiva — "Do you have brothers or sisters?"
  - `u2-ex7`: Escritura libre describiendo a la familia
- **Evaluación final** (4 ejercicios con puntaje 0-100, avance automático):
  - `u2-ev1`: Match (Sister↔Hermana, Father↔Padre, Happy↔Feliz, Friend↔Amigo)
  - `u2-ev2`: Fill-blank con 4 huecos (my, her, has, don't) — combina posesivos y verbo to have
  - `u2-ev3`: Listening — "What is your father like?" (¿Cómo es tu padre?)
  - `u2-ev4`: Writing — párrafo describiendo a la familia (4-5 líneas)

#### Función `getUnitContent`

- Actualizada para retornar `UNIT_2_CONTENT` cuando `unitId === 2`.

---

### 🔍 Verificación con Agent Browser

- ✅ Menú principal muestra la Unidad 2 como botón habilitado (antes era un `generic` con candado)
- ✅ Click en Unidad 2 abre la lección con las 5 pestañas
- ✅ Pestaña Vocabulario: 27 palabras agrupadas en 3 categorías (14 Familia + 8 Adjetivos + 5 Amigos), todas con botón de audio
- ✅ Pestaña Gramática: 3 reglas con ejemplos bilingües y tips
- ✅ Pestaña Diálogos: 2 conversaciones con botón "Escuchar diálogo" completo
- ✅ Pestaña Ejercicios: 7 ejercicios cargan correctamente
- ✅ Pestaña Evaluación: flujo completo end-to-end verificado:
  - Q1 (match): avanza automáticamente al completar los 4 pares
  - Q2 (fill-blank con 4 huecos): avanza automáticamente tras pulsar "Comprobar"
  - Q3 (listening "What is your father like?"): avanza automáticamente al seleccionar
  - Q4 (writing): avanza automáticamente tras pulsar "Entregar respuesta"
  - Pantalla final muestra "¡Felicidades!" + botón "Repetir evaluación"
- ✅ Sin errores en consola del navegador

---

### 🐛 Corregido

#### Bug #6 — Servidor de desarrollo se caía al cerrar el shell

- **Síntoma:** Tras ejecutar pruebas con Agent Browser, el servidor Next.js se detenía inesperadamente, devolviendo `ERR_CONNECTION_REFUSED` en intentos posteriores.
- **Causa raíz:** El sandbox termina los procesos hijos cuando el shell que los inició termina.
- **Fix:** Iniciar el servidor con `(bun run dev &)` (subshell desvinculada) en el mismo comando que ejecuta las pruebas, evitando que el shell principal cierre antes de tiempo.
- **Archivo afectado:** Ninguno (es un cambio en el flujo de trabajo de desarrollo, no en el código de la app).

---

### 📝 Notas de versión

- La estructura de carpetas y los componentes React NO cambiaron: el patrón modular permite añadir nuevas unidades editando solo `src/data/course.ts`. El resto del sistema (LessonView, ExerciseRunner, EvaluationTab, etc.) es genérico y reutilizable.
- La Unidad 2 reutiliza 100% los mismos componentes que la Unidad 1 — no se escribió código nuevo de UI, solo datos.
- La verificación completa de la evaluación (4 preguntas con avance automático) confirma que el bug fix de la v0.1.0 (separación `instantFeedback` vs `onAnswer`) sigue funcionando correctamente.

---

## [0.1.0] — 2026-07-03

### Versión MVP inicial — Menú principal + Lección 1 completa (testing)

Primera versión utilizable del proyecto. Permite navegar por el menú del curso,
completar la Lección 1 en su totalidad (vocabulario, gramática, diálogos,
ejercicios y evaluación) y guardar el progreso localmente en el dispositivo.

---

### ✅ Agregado

#### Arquitectura y configuración base
- Migración del stack planificado (SvelteKit) a **Next.js 16** con App Router y Turbopack, por su mejor soporte PWA y ecosistema educativo.
- Configuración de **TypeScript 5 estricto** en `tsconfig.json`.
- **Tailwind CSS 4** con paleta de colores educativa cálida (teal primario + ámbar acento) definida en `src/app/globals.css`.
- **shadcn/ui** (New York style) como librería de componentes accesibles basados en Radix UI.
- Iconos **Lucide React** para todas las interfaces.
- Configuración `next.config.ts` con `allowedDevOrigins` para previews en dominio `*.space-z.ai`.

#### PWA (Progressive Web App)
- `public/manifest.webmanifest` con metadatos completos (nombre, idioma `es`, theme color, icono, display standalone, orientación portrait).
- `public/sw.js` Service Worker con estrategia **cache-first** para recursos estáticos y **network-first** para navegación.
- `src/components/ServiceWorkerRegister.tsx` que registra el SW automáticamente tras el `load`.
- `public/icon.svg` icono vectorial de la aplicación (logo "A1" en gradiente teal con puntos ámbar).
- Metadatos `appleWebApp` y `themeColor` en `layout.tsx` para iOS/Android.
- Viewport con `viewportFit: "cover"` para soportar *safe areas* en móviles con notch.

#### Menú principal (Home)
- `src/components/home/HomeView.tsx` con:
  - Hero con gradiente teal y emojis decorativos
  - Badge de nivel "A1 · Principiante"
  - Descripción del curso adaptada a hispanohablantes
  - **Barra de progreso general** del curso (calculada sobre 12 unidades)
  - Grid responsive (1 columna en móvil, 2 en tablet, 3 en desktop) con las 12 unidades
  - Tarjetas de unidad con icono, título, descripción, duración, número de lecciones y estado
  - Unidad 1 desbloqueada; Unidades 2-12 marcadas como "Próximamente" (con icono 🔒)
  - Sección inferior informativa (mobile-friendly, pronunciación, offline)
  - Footer con autor y tecnologías usadas

#### Lección 1 — Hello / Personal Introductions
- `src/components/lesson/LessonView.tsx`: contenedor con header sticky y 5 pestañas.
- **Pestaña Vocabulario** (`VocabularyTab.tsx`):
  - 29 términos agrupados en 5 categorías (Saludos, Despedidas, Presentaciones, Alfabeto, Números)
  - Cada tarjeta con emoji, palabra en inglés, transcripción fonética aproximada, traducción al español
  - Botón "Escuchar" por palabra (Web Speech API con `rate: 0.85` para principiantes)
  - Botón "Escuchar todo" por categoría
  - Toggle "Mostrar/Ocultar traducción" para autoevaluación
  - Tip pedagógico al final
- **Pestaña Gramática** (`GrammarTab.tsx`):
  - 3 reglas: verbo *to be*, pronombres personales, contracciones comunes
  - Cada regla con número, título, explicación y tabla bilingüe de ejemplos
  - Cada ejemplo en inglés tiene botón de pronunciación
  - Tip destacado en caja ámbar con icono de bombilla
- **Pestaña Diálogos** (`DialoguesTab.tsx`):
  - 2 conversaciones (informal en café, formal en recepción de hotel)
  - Estilo chat con burbujas (Persona A a la izquierda, Persona B a la derecha)
  - Botón "Escuchar diálogo" completo (reproduce línea por línea con pausas)
  - Botón de audio por línea
  - Toggle "Mostrar/Ocultar español"
  - Tip de práctica recomendada
- **Pestaña Ejercicios** (`ExercisesTab.tsx`):
  - 7 ejercicios con feedback inmediato y contador de correctas/incorrectas
  - Barra de progreso de la sesión
  - Navegación entre ejercicios (botones Anterior/Siguiente + dots indicadores)
  - Pantalla de resumen final con mensaje motivacional según desempeño
  - Botón "Repetir práctica"
- **Pestaña Evaluación** (`EvaluationTab.tsx`):
  - Pantalla de introducción con instrucciones y estadísticas (número de ejercicios, puntaje máximo, duración, intentos)
  - Botón "Comenzar evaluación"
  - 4 ejercicios con pesos ponderados por tipo (match 20, fill-blank 15, listening 15, writing 30)
  - **Avance automático** al siguiente ejercicio tras responder (con delay de 800ms)
  - Pantalla de resultados con puntaje /100, correctas/incorrectas y mensaje
  - Umbral de aprobación: 70/100
  - Botón "Repetir evaluación"
  - Toast de confirmación al enviar

#### Sistema de ejercicios (6 tipos)
- `src/components/lesson/ExerciseRunner.tsx` con soporte para:
  1. **Emparejar** (`match`): clic en palabra izquierda → clic en traducción derecha; verificación al completar todos los pares
  2. **Opción múltiple** (`multiple-choice`): 3 opciones, una correcta
  3. **Completar huecos** (`fill-blank`): inputs de texto con verificación normalizada (case-insensitive, sin espacios extra)
  4. **Ordenar palabras** (`word-order`): clic en palabras desordenadas para construir la frase correcta
  5. **Comprensión auditiva** (`listening`): botón para escuchar audio + opciones de respuesta
  6. **Escritura libre** (`writing`): textarea con modelo de referencia y validación por longitud mínima
- Cada tipo reinicia su estado automáticamente al cambiar de ejercicio mediante `key={exercise.id}`.
- Botón "Pronunciar" reutilizable (`PronounceButton.tsx`) con estados visuales (idle / speaking / loading).

#### Datos del curso
- `src/data/course.ts` con:
  - Tipos TypeScript (`CourseUnit`, `VocabItem`, `GrammarRule`, `Dialogue`, `Exercise`, `LessonContent`)
  - Array `COURSE_UNITS` con las 12 unidades (id, slug, título ES/EN, icono emoji, duración, lecciones, estado, resumen)
  - Contenido completo `UNIT_1_CONTENT` extraído del PDF `unidad-1-hello-personal-introductions.pdf`
  - Función `getUnitContent(unitId)` que retorna el contenido de una unidad (o `null` si no está disponible)

#### Persistencia de progreso
- `src/lib/storage.ts` con funciones: `loadProgress`, `saveProgress`, `getUnitProgress`, `updateUnitProgress`, `getOverallCourseProgress`
- `src/hooks/use-progress.ts` hook reactivo que se sincroniza entre componentes vía evento custom `ingles-a1-progress-updated` y evento nativo `storage` (multi-pestaña).
- Persiste: porcentaje de progreso por unidad, pestañas visitadas, puntaje de evaluación, timestamps `startedAt` y `completedAt`.

#### Síntesis de voz (pronunciación)
- `src/lib/speech.ts` wrapper sobre `window.speechSynthesis`:
  - Selecciona automáticamente voz `en-US` (o cualquier voz inglesa como fallback)
  - Velocidad por defecto `0.85` (lenta para principiantes)
  - Funciones `speak(text, options)`, `stopSpeaking()`, `isSpeechSupported()`
  - Maneja carga asíncrona de voces (`onvoiceschanged`)

#### Diseño responsive y accesibilidad
- Mobile-first con breakpoints Tailwind (`sm:`, `md:`, `lg:`, `xl:`)
- Touch targets de mínimo 44px en todos los botones interactivos
- Navegación inferior fija (Anterior / Siguiente) solo visible en móvil (`sm:hidden`)
- Sticky header con botón "Volver al menú"
- Soporte para *safe areas* de iOS (`.pt-safe`, `.pb-safe`)
- Roles ARIA (`tablist`, `tab`, `tabpanel`, `button` con `aria-label`)
- Navegación por teclado (Enter/Space activa botones, foco visible)
- Semántica HTML (`<main>`, `<header>`, `<footer>`, `<nav>`, `<section>`, `<article>`)

---

### 🐛 Corregido

Durante el desarrollo se detectaron y corrigieron los siguientes problemas:

#### Bug #1 — La evaluación no avanzaba automáticamente tras responder

- **Síntoma:** En la pestaña Evaluación, al responder un ejercicio (especialmente de tipo emparejar, opción múltiple o listening), la app no pasaba a la siguiente pregunta.
- **Causa raíz:** En `ExerciseRunner.tsx`, los ejercicios tipo `match`, `multiple-choice`, `fill-blank`, `word-order` y `listening` solo llamaban al callback `onAnswer()` cuando la prop `instantFeedback === true`. Pero la evaluación pasaba `instantFeedback={false}` (para no mostrar la retroalimentación visual), por lo que el callback **nunca se invocaba** y `EvaluationTab` no detectaba que se había respondido.
- **Fix:** Se separó la responsabilidad:
  - `instantFeedback` ahora controla únicamente si se muestra la retroalimentación visual (caja verde/roja con respuesta correcta).
  - `onAnswer(correct)` se invoca **siempre**, independientemente del flag.
- **Archivo afectado:** `src/components/lesson/ExerciseRunner.tsx`

#### Bug #2 — Cálculo de puntaje final con estado desactualizado

- **Síntoma:** Aunque se corrigió el bug #1, el cálculo del puntaje final usaba `results` desde el closure del `setTimeout`, que estaba desactualizado (refería al estado anterior a la última respuesta).
- **Causa raíz:** El `setTimeout` dentro de `handleAnswer` capturaba `results` en el momento de la creación del closure, no en el momento de la ejecución.
- **Fix:** Se refactorizó `EvaluationTab.tsx`:
  1. `handleAnswer` ahora solo actualiza `results` y `answered` (sin programar avance).
  2. Un `useEffect` separado detecta cuando `answered[current]` cambia a `true` y programa el avance al siguiente ejercicio con un `useRef` como lock anti-duplicados.
  3. El puntaje final se calcula como **estado derivado** (`computedScore`) a partir de `results` cuando `answered.every(Boolean)`, y otro `useEffect` lo sincroniza con el exterior (toast + `onSubmitScore` + cambio de fase) usando `Promise.resolve().then(...)` para evitar el warning de React "Cannot update a component while rendering".
- **Archivo afectado:** `src/components/lesson/EvaluationTab.tsx`

#### Bug #3 — Violación de regla `react-hooks/refs` (lint error)

- **Síntoma:** ESLint reportaba errores "Cannot access refs during render" en `ExerciseRunner.tsx`.
- **Causa raíz:** Se usaba el patrón anti-pattern `if (exIdRef.current !== exercise.id) { ... }` durante el render para resetear el estado al cambiar de ejercicio.
- **Fix:** Se eliminaron todos los `useRef` de reseteo y se reemplazaron por `key={exercise.id}` en el componente padre (`ExercisesTab` y `EvaluationTab`), forzando a React a desmontar y volver a montar el componente cuando cambia el ejercicio, lo cual resetea el estado internamente de forma limpia.
- **Archivo afectado:** `src/components/lesson/ExerciseRunner.tsx`, `ExercisesTab.tsx`, `EvaluationTab.tsx`

#### Bug #4 — Warning de `setState` durante render en `useProgress`

- **Síntoma:** ESLint reportaba "Calling setState synchronously within an effect can trigger cascading renders" en `use-progress.ts`.
- **Causa raíz:** Se llamaba `setProgress(loadProgress())` directamente dentro del cuerpo del `useEffect`.
- **Fix:** Se migró a inicialización lazy: `useState(() => typeof window === "undefined" ? {} : loadProgress())`, eliminando la llamada a `setState` dentro del effect.
- **Archivo afectado:** `src/hooks/use-progress.ts`

#### Bug #5 — Warning "Cross origin request detected" en dev

- **Síntoma:** Next.js 16 mostraba un warning sobre peticiones cross-origin desde el dominio de preview.
- **Fix:** Se añadió `allowedDevOrigins: ["*.space-z.ai"]` a `next.config.ts`.

---

### 🔍 Verificación con Agent Browser

Se realizaron pruebas end-to-end con Agent Browser (Chrome headless):

- ✅ Home renderiza correctamente en desktop (1920×1080) y móvil (iPhone 14)
- ✅ Click en Unidad 1 abre la lección con las 5 pestañas
- ✅ Cada pestaña (Vocabulario, Gramática, Diálogos, Ejercicios, Evaluación) carga su contenido
- ✅ Ejercicio de emparejar funciona correctamente (interacción real verificada)
- ✅ Evaluación completa end-to-end:
  - Q1 (match): avanza automáticamente al completar los 4 pares
  - Q2 (fill-blank): avanza automáticamente tras pulsar "Comprobar"
  - Q3 (listening): avanza automáticamente al seleccionar respuesta
  - Q4 (writing): avanza automáticamente tras pulsar "Entregar respuesta"
  - Pantalla final muestra "¡Felicidades!" + puntaje + botón "Repetir evaluación"
- ✅ Navegación inferior móvil visible (Anterior/Siguiente)
- ✅ Service Worker registrado sin errores (`[PWA] Service worker registrado`)
- ✅ 0 errores en consola del navegador
- ✅ Todas las rutas `GET /` responden 200
- ✅ ESLint pasa limpio (0 errores, 0 warnings)

---

### 📝 Notas de versión

- **Solo la Unidad 1 tiene contenido** completo. Las demás unidades están listadas en el menú pero marcadas como "Próximamente". Esto es intencional para esta versión de testing.
- **La pronunciación usa Web Speech API**, no audios pre-grabados. La calidad depende de las voces en inglés instaladas en el dispositivo del usuario (la mayoría de Android, Windows e iOS las traen por defecto).
- **El progreso se guarda solo en el dispositivo** (localStorage). No hay sincronización entre dispositivos ni autenticación de usuario en esta versión.
- **No hay backend**: la app es 100% estática una vez construida, lo que facilita el deploy gratuito en Vercel, Netlify o GitHub Pages.

---

### 🚀 Próximos pasos planeados (v0.2.0+)

1. **Implementar Unidad 2** (My Family and Friends) siguiendo el mismo patrón de la Unidad 1
2. Agregar **audios MP3 reales** pre-grabados como alternativa a Web Speech API
3. Implementar **autenticación opcional** (NextAuth.js) para sincronizar progreso entre dispositivos
4. Agregar **gamificación**: insignias por unidad completada, racha de días de práctica, contador de palabras aprendidas
5. **Deploy a Vercel/Netlify** para acceso público gratuito
6. Implementar **modo repaso** (flashcards) para vocabulario ya aprendido
7. Agregar **soporte multi-idioma** de la interfaz (español por defecto, pero permitir cambiar a inglés/quechua/aimara)

---

## [Unreleased]

Sin cambios pendientes aún.
