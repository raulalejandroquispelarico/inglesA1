/**
 * Versión de la app.
 * ==================
 *
 * Se lee de package.json. Este archivo se importa SOLO desde Server
 * Components (ej: layout.tsx) para que package.json se resuelva en el
 * servidor y no se meta en el bundle del cliente.
 *
 * Si en el futuro el proyecto se publica como paquete npm y package.json
 * no está accesible, reemplazar por una constante hardcodeada.
 */

import pkg from "../../package.json";

export const APP_VERSION: string = pkg.version;
