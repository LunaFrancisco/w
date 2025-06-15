import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StaticNavigation from '@/components/StaticNavigation'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Club W - Tu Club Privado de Compras Exclusivas",
  description: "Club W es tu club privado de compras exclusivas con acceso a productos premium y precios especiales solo para miembros verificados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <StaticNavigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
