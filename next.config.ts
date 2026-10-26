import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Permitir peticiones HMR/WebSocket desde la red local (celular en mismo WiFi)
  // y desde túneles públicos comunes.
  //
  // Next.js 16 soporta: strings exactas, wildcards (*.dominio), y CIDR.
  // Incluimos múltiples formatos para máxima compatibilidad.
  allowedDevOrigins: [
    // IPs de red local comunes (formato CIDR)
    "192.168.0.0/16",
    "10.0.0.0/8",
    "172.16.0.0/12",
    // Wildcards para subdominios de túneles
    "*.loca.lt",
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.vercel.app",
  ],
};

export default nextConfig;
