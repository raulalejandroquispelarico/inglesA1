# Plataforma Educativa de Inglés A1 (Hispanohablantes)

## Descripción General

Este proyecto es una **Aplicación Web Progresiva (PWA)** desarrollada como un plan de estudio interactivo para aprender **inglés nivel A1**, específicamente diseñado para **hispanohablantes**. Se basa fielmente en el material pedagógico detallado en las guías `GUIA-DE-ACTIVIDADES-INGLES-A1.pdf` y `GUIA-DE-ACTIVIDADES-INGLES-A1-indice-menu.pdf`, disponibles en la carpeta `./pdf/`.

El objetivo principal es transformar el contenido estático de las guías en una experiencia de aprendizaje dinámica, accesible, multiplataforma (PC y Android) y funcional tanto en línea como fuera de línea (offline-first), utilizando exclusivamente tecnologías de **código abierto** y **servicios gratuitos**.

## Características

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