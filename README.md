# Plataforma Educativa de Inglés A1 (Hispanohablantes)

<<<<<<< HEAD
> **Versión actual:** `0.3.1` — Build arreglado: eliminados componentes ui/ no usados que causaban error de dependencias.
> Consulta [`CHANGELOG.md`](./CHANGELOG.md) para el historial de cambios y correcciones.

## Descripción General

Este proyecto es una **Aplicación Web Progresiva (PWA)** desarrollada como un plan de estudio interactivo para aprender **inglés nivel A1**, específicamente diseñado para **hispanohablantes**. Se basa fielmente en el material pedagógico detallado en las guías PDF de la carpeta `./pdf/`.
=======
## Descripción General

Este proyecto es una **Aplicación Web Progresiva (PWA)** desarrollada como un plan de estudio interactivo para aprender **inglés nivel A1**, específicamente diseñado para **hispanohablantes**. Se basa fielmente en el material pedagógico detallado en las guías `GUIA-DE-ACTIVIDADES-INGLES-A1.pdf` y `GUIA-DE-ACTIVIDADES-INGLES-A1-indice-menu.pdf`, disponibles en la carpeta `./pdf/`.
>>>>>>> 2388549a9ce9131fe26a6286fcaba3d796c09413

El objetivo principal es transformar el contenido estático de las guías en una experiencia de aprendizaje dinámica, accesible, multiplataforma (PC y Android) y funcional tanto en línea como fuera de línea (offline-first), utilizando exclusivamente tecnologías de **código abierto** y **servicios gratuitos**.

## Características

<<<<<<< HEAD
- **Multiplataforma:** Funciona en navegadores web modernos de PC (Windows, macOS, Linux) y dispositivos móviles Android (y potencialmente iOS).
- **Instalable (PWA):** Se puede instalar en el dispositivo como una aplicación nativa, con su icono en la pantalla de inicio / escritorio.
- **Offline-First:** Funciona sin conexión gracias a un Service Worker que cachea los recursos esenciales.
- **Código Abierto y Gratuito:** Utiliza únicamente tecnologías, frameworks y herramientas de código abierto y sin costo de licencia ni hosting recurrente significativo.
- **Fiel al Contenido Pedagógico:** Representa fielmente las unidades, lecciones, vocabulario, gramática, diálogos y ejercicios definidos en las guías originales.
- **Interfaz Intuitiva:** UX/UI clara y motivadora, adaptada para adultos hispanohablantes principiantes.
- **Pronunciación Integrada:** Cada palabra, ejemplo y diálogo puede escucharse con un clic, usando la Web Speech API del navegador (sin necesidad de archivos de audio pre-grabados).

## Stack Tecnológico

> **Nota:** El repositorio original planeaba usar SvelteKit. En esta implementación se migró a **Next.js 16** porque ofrece mejor soporte PWA, App Router y un ecosistema más maduro para aplicaciones educativas escalables. Las características originales (offline-first, instalable, gratuito) se mantienen 100%.

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Lenguaje:** TypeScript 5 estricto
- **Estilos:** Tailwind CSS 4 con paleta educativa cálida (teal + ámbar)
- **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/) (componentes accesibles basados en Radix UI)
- **Iconos:** Lucide React
- **Voz:** Web Speech API (`SpeechSynthesis`) para pronunciación sin archivos de audio
- **Persistencia:** `localStorage` para progreso del estudiante (offline-first)
- **PWA:** `manifest.webmanifest` + Service Worker (`public/sw.js`) con estrategia cache-first
- **Control de Versiones:** Git + GitHub

## Estado del Proyecto (v0.2.0)

### ✅ Implementado

- **Menú principal (Home)** con grid de las 12 unidades del curso
  - Unidades 1 y 2 desbloqueadas y jugables
  - Unidades 3-12 marcadas como "Próximamente"
  - Barra de progreso general del curso
  - Hero con descripción del curso
  - Sección informativa (mobile-friendly, pronunciación, offline)
- **Lección 1: Hello — Personal Introductions** (completa, con 5 secciones)
- **Lección 2: My Family and Friends** (completa, con 5 secciones)
  1. **Vocabulario** — términos agrupados por categoría con pronunciación fonética, traducción, audio individual y botón "Escuchar todo"
  2. **Gramática** — reglas con explicación, tabla de ejemplos bilingüe y tips pedagógicos
  3. **Diálogos** — conversaciones con estilo chat, audio por línea y audio completo
  4. **Ejercicios** — 7 ejercicios de 6 tipos (emparejar, opción múltiple, completar huecos, ordenar palabras, comprensión auditiva, escritura libre) con retroalimentación inmediata
  5. **Evaluación final** — 4 ejercicios con puntaje 0-100, avance automático y opción de repetir
- **Sistema de progreso** persistente en `localStorage` (porcentaje de lección, pestañas visitadas, puntaje de evaluación)
- **Diseño responsive** mobile-first con:
  - Touch targets de mínimo 44px
  - Navegación inferior (Anterior / Siguiente) en móvil
  - Sticky header con botón "Volver al menú"
  - Soporte para *safe areas* de iOS
- **PWA instalable** con manifest + service worker + icono + theme color
- **Accesibilidad**: roles ARIA, navegación por teclado, labels descriptivos, semántica HTML (`<main>`, `<header>`, `<footer>`, `<nav>`)

### 🚧 Pendiente

- Implementar Unidades 3-12 siguiendo el mismo patrón (cada una con su PDF de origen)
- Agregar audios reales pre-grabados como alternativa a Web Speech API
- Implementar autenticación opcional (NextAuth) para sincronizar progreso entre dispositivos
- Agregar gamificación (insignias, racha de días, ranking)
- Deploy a Vercel/Netlify para acceso público

## Estructura del Proyecto

```
.
├── pdf/                          # Guías pedagógicas PDF originales (12 unidades)
├── public/
│   ├── manifest.webmanifest      # Manifest PWA
│   ├── sw.js                     # Service Worker (offline-first)
│   ├── icon.svg                  # Icono de la app
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── page.tsx              # Router entre Home y Lección
│   │   ├── layout.tsx            # Metadata ES, Toaster, registro SW
│   │   └── globals.css           # Paleta educativa custom + utilidades
│   ├── data/
│   │   └── course.ts             # 12 unidades + contenido completo Unidad 1
│   ├── lib/
│   │   ├── storage.ts            # Persistencia offline-first
│   │   └── speech.ts             # Wrapper Web Speech API
│   ├── hooks/
│   │   └── use-progress.ts       # Hook de progreso del curso
│   └── components/
│       ├── home/
│       │   └── HomeView.tsx              # Menú principal (grid de unidades)
│       ├── lesson/
│       │   ├── LessonView.tsx           # Contenedor con 5 pestañas
│       │   ├── VocabularyTab.tsx        # Vocabulario con audio
│       │   ├── GrammarTab.tsx           # Reglas de gramática
│       │   ├── DialoguesTab.tsx         # Diálogos con audio
│       │   ├── ExercisesTab.tsx         # 7 ejercicios con feedback
│       │   ├── EvaluationTab.tsx        # Evaluación final (puntaje 0-100)
│       │   ├── ExerciseRunner.tsx       # 6 tipos de ejercicios
│       │   └── PronounceButton.tsx      # Botón reutilizable de audio
│       └── ServiceWorkerRegister.tsx
├── CHANGELOG.md                  # Historial de versiones
├── README.md                     # Este archivo
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Cómo ejecutar el proyecto localmente

### Requisitos previos

- [Node.js](https://nodejs.org/) 18+ o [Bun](https://bun.sh/) (recomendado)
- Un navegador moderno (Chrome, Edge, Firefox, Safari)

### ⚠️ IMPORTANTE: Si actualizaste desde una versión anterior

Si ya tenías una versión vieja del proyecto instalada y **ves un error de "Hydration failed"** en consola al cargar la página, necesitas limpiar el Service Worker viejo del navegador **UNA SOLA VEZ**:

#### En Chrome/Edge (PC):

1. Abre `http://localhost:3000` en el navegador
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Application** (o "Aplicación")
4. En el panel izquierdo, bajo **Service Workers**:
   - Si hay alguno listado, haz clic en **Unregister** (o "Cancelar registro")
5. En el panel izquierdo, bajo **Storage** (Almacenamiento):
   - Haz clic en **Clear site data** (o "Borrar datos del sitio")
6. Cierra DevTools
7. Recarga con **Ctrl + Shift + R** (recarga forzada)

#### En Chrome (Android):

1. Mantén presionado el icono de Chrome
2. **Información de la app** → **Almacenamiento** → **Borrar datos**
3. Vuelve a abrir `http://TU_IP:3000`

Después de esta limpieza única, el código nuevo (v0.2.5+) se encarga automáticamente de desinstalar el Service Worker en cada recarga mientras estés en desarrollo. **No volverás a tener el problema.**

### Instalación

```bash
# 1. Clonar el repositorio (o descomprimir el ZIP descargado)
git clone https://github.com/raulalejandroquispelarico/inglesA1.git
cd inglesA1

# 2. Instalar dependencias
bun install
# o alternativamente: npm install

# 3. Generar el cliente de Prisma (necesario una sola vez)
bun run db:generate

# 4. Iniciar el servidor de desarrollo
bun run dev
# o alternativamente: npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

> **¿No tienes Bun?** Instálalo desde https://bun.sh/ (es como npm pero más rápido).
> También puedes usar `npm` normal en lugar de `bun` para todos los comandos.

### Scripts disponibles

| Script                | Descripción                                          |
| --------------------- | ---------------------------------------------------- |
| `bun run dev`         | Inicia el servidor en `0.0.0.0:3000` (accesible desde la red local) |
| `bun run build`       | Compila la app para producción                        |
| `bun run start`       | Inicia el servidor de producción                      |
| `bun run lint`        | Ejecuta ESLint para verificar calidad del código     |
| `bun run db:generate` | Genera el cliente de Prisma (solo la primera vez)    |
| `bun run db:push`     | Aplica el schema a la base de datos SQLite           |

> **Nota:** El script `dev` ya incluye `-H 0.0.0.0` para que el servidor escuche en todas las interfaces de red. Esto permite acceder desde el celular conectado al mismo WiFi.

## 📱 Acceso desde el celular (Android)

> ⚠️ **IMPORTANTE**: Para probar en el celular, usa el **modo producción** (`bun run start`), NO el modo desarrollo (`bun run dev`). El modo desarrollo tiene restricciones de seguridad que bloquean el acceso desde otros dispositivos en la red local.

### 🟢 Opción recomendada: Modo producción + WiFi local

Esta es la forma que **funciona sin problemas en Android**. La PC y el celular deben estar en el mismo WiFi.

**Pasos:**

1. **En tu PC**, compila la app y arranca el servidor de producción:
   ```bash
   bun run build
   bun run start
   ```
   Verás:
   ```
   ▲ Next.js 16.2.10
   - Local:   http://localhost:3000
   - Network: http://0.0.0.0:3000
   ✓ Ready in 600ms
   ```

2. **Averigua la IP local de tu PC**:
   - **Windows**: abre CMD → escribe `ipconfig` → busca "Dirección IPv4" (algo como `192.168.1.50`)
   - **Linux/Mac**: abre terminal → escribe `ip addr` o `ifconfig` → busca `inet 192.168.x.x`

3. **En tu celular Android**, abre **Chrome** y visita:
   ```
   http://192.168.1.50:3000
   ```
   (cambia la IP por la de tu PC)

4. ¡Listo! La app cargará en el celular con todas las funciones (pronunciación, ejercicios, evaluación, etc.)

> ⚠️ **Si no carga**: tu firewall de Windows puede estar bloqueando el puerto. Cuando te aparezca el aviso, permite el acceso a Node.js. O desactiva temporalmente el firewall de Windows para redes privadas.

### ¿Por qué modo producción y no desarrollo?

El modo desarrollo (`bun run dev`) tiene **restricciones de seguridad** que bloquean las peticiones JavaScript desde IPs externas (cross-origin). Esto hace que en Android la página se quede "pensando" para siempre, porque el JS nunca carga.

El modo producción (`bun run start`) no tiene estas restricciones, así que Android puede acceder sin problemas.

**Flujo de trabajo recomendado:**
- Para **desarrollar y probar en la PC**: usa `bun run dev` (más rápido, recarga automática)
- Para **probar en el celular**: usa `bun run build && bun run start` (sin restricciones)

> 💡 Cada vez que cambies el código y quieras probar en el celular, necesitas re-build: detén el servidor con `Ctrl+C`, ejecuta `bun run build`, luego `bun run start`.

### 🌐 Alternativa: Túnel público (acceso desde cualquier lado)

Si no estás en el mismo WiFi que el celular, o quieres compartir la app con alguien remoto:

#### Con localtunnel (gratis, sin registro):
```bash
# En tu PC, con la app corriendo en localhost:3000:
npx localtunnel --port 3000
# Te dará una URL como https://random-words.loca.lt
```

#### Con ngrok (necesita registro gratis):
1. Instálalo desde https://ngrok.com/
2. En tu PC:
   ```bash
   ngrok http 3000
   ```
3. Te dará una URL pública tipo `https://abc123.ngrok-free.app`
4. Ábrela en Chrome del celular desde cualquier red

### 🚀 Definitivo: Deploy a Vercel

Cuando quieras que la app sea **pública y permanente** (accesible desde cualquier celular sin necesidad de que tu PC esté encendida), la subes a Vercel gratis:

1. Crea cuenta en https://vercel.com con tu GitHub
2. Sube tu repo a GitHub
3. En Vercel: **"Add New Project"** → selecciona tu repo → **"Deploy"**
4. En 1-2 minutos tendrás una URL pública: `https://ingles-a1-tu-nombre.vercel.app`
5. Ábrela en Chrome del celular

---

### 📲 Cómo INSTALARLA como app nativa (PWA)

Una vez que la app sea accesible (por cualquiera de las opciones anteriores), puedes instalarla para que tenga **su propio icono** en la pantalla de inicio y funcione **offline**:

#### En Android (Chrome):
1. Abre la URL en Chrome
2. Toca el menú **⋮** (arriba a la derecha)
3. Selecciona **"Agregar a la pantalla de inicio"** o **"Instalar aplicación"**
4. Confirma → aparecerá el icono 📚 en tu pantalla de inicio
5. A partir de ahí, se abre como una app nativa (sin barra del navegador)

#### En Windows (Chrome o Edge):
1. Abre la URL
2. Haz clic en el icono **⊕ Instalar** en la barra de direcciones
3. Se abre en ventana propia y aparece en el menú inicio

#### En iOS (Safari):
1. Abre la URL en Safari
2. Toca el botón **Compartir** (cuadrado con flecha hacia arriba)
3. Selecciona **"Añadir a pantalla de inicio"**

---

## Contenido Pedagógico (Basado en Guías PDF)

| Unidad | Título                                   | Estado          |
| ------ | ---------------------------------------- | --------------- |
| 1      | Hello — Personal Introductions           | ✅ Disponible    |
| 2      | My Family and Friends                    | ✅ Disponible    |
| 3      | Numbers, Dates and Time                  | 🚧 Próximamente |
| 4      | My Home and Belongings                   | 🚧 Próximamente |
| 5      | Daily Routines                           | 🚧 Próximamente |
| 6      | Food and Drinks                          | 🚧 Próximamente |
| 7      | Shopping and Prices                      | 🚧 Próximamente |
| 8      | Places in Town                           | 🚧 Próximamente |
| 9      | Hobbies and Free Time                    | 🚧 Próximamente |
| 10     | Travel and Transportation                | 🚧 Próximamente |
| 11     | Weather and Seasons                      | 🚧 Próximamente |
| 12     | Review and Final Project                 | 🚧 Próximamente |

## Autor

**Raul Alejandro Quispe Larico**

## Licencia

MIT — Libre uso, modificación y distribución. Ver archivo `LICENSE` para más detalles.

---

*Este proyecto busca democratizar el acceso al aprendizaje del inglés básico mediante tecnología accesible y abierta.*
=======
*   **Multiplataforma:** Funciona en navegadores web modernos de PC y dispositivos móviles Android (y potencialmente iOS).
*   **Instalable (PWA):** Se puede instalar en el dispositivo como una aplicación nativa.
*   **Offline-First:** Diseñada para funcionar con gran parte del contenido disponible sin conexión.
*   **Código Abierto y Gratuito:** Utiliza únicamente tecnologías, frameworks y herramientas de código abierto y sin costo de licencia ni hosting recurrente significativo.
*   **Fieltro al Contenido Pedagógico:** Representa fielmente las unidades, lecciones, vocabulario, gramática, diálogos y ejercicios definidos en las guías originales.
*   **Interfaz Intuitiva:** UX/UI clara y motivadora, adaptada para adultos hispanohablantes principiantes.

## Stack Tecnológico (JAMstack)

*   **Frontend:** [SvelteKit](https://kit.svelte.dev/) (o alternativamente Vanilla JS + Alpine.js).
*   **Lenguaje:** JavaScript (ES6+).
*   **Almacenamiento de Contenido:** Archivos JSON locales y/o alojados en servicios gratuitos (GitHub Pages, Netlify).
*   **Persistencia de Datos del Usuario:** IndexedDB (para progreso, puntajes).
*   **Multimedia:** Recursos estáticos (audios, imágenes) alojados localmente o referenciados.
*   **Alojamiento:** Servicios gratuitos de hosting estático (Netlify, Vercel, GitHub Pages).
*   **Control de Versiones:** Git.

## Estructura del Contenido (Basado en Guías PDF)

*   **Unidades:** Agrupaciones temáticas (p. ej., "Saludos", "Familia", "Colores").
*   **Lecciones:** Subdivisiones dentro de las unidades que pueden contener:
    *   **Vocabulario:** Palabras con imágenes y audios de pronunciación.
    *   **Gramática:** Explicaciones y ejemplos breves.
    *   **Diálogos:** Conversaciones cortas para lectura y escucha.
    *   **Ejercicios:** Actividades interactivas (emparejar, completar, seleccionar, escribir, etc.).

## Estado del Proyecto

Actualmente en fase de **planificación y configuración inicial**. Se han definido los objetivos, el stack tecnológico y la base de contenido. El próximo paso es comenzar el desarrollo del MVP (Producto Mínimo Viable) que implemente una unidad completa del curso.

## Autor

Raul Alejandro Quispe Larico

---

*Este proyecto busca democratizar el acceso al aprendizaje del inglés básico mediante tecnología accesible y abierta.*
>>>>>>> 2388549a9ce9131fe26a6286fcaba3d796c09413
