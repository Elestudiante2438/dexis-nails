import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dexi's Nails · Experiencia Cósmica",
  description: "Salón de belleza cósmico. Manicura, Podología, Facial, Perfumes árabes y Diagnóstico con IA.",
  keywords: ["Dexi's Nails", "manicura", "podología", "facial", "perfumes", "belleza", "uñas"],
  authors: [{ name: "Dexi's Nails" }],
  icons: {
    icon: "💅",
  },
  openGraph: {
    title: "Dexi's Nails · Experiencia Cósmica",
    description: "Salón de belleza cósmico con IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Orbitron:wght@400;700;900&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
