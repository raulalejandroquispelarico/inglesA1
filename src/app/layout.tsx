import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inglés A1 — Curso para hispanohablantes",
  description:
    "Plataforma educativa interactiva para aprender inglés nivel A1, diseñada para hispanohablantes. Lecciones con vocabulario, gramática, diálogos y ejercicios.",
  keywords: [
    "inglés",
    "A1",
    "principiantes",
    "hispanohablantes",
    "curso",
    "PWA",
    "aprender inglés",
  ],
  authors: [{ name: "Raul Alejandro Quispe Larico" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inglés A1",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d7a7a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "rounded-xl border shadow-lg",
            },
          }}
        />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
