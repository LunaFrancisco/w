import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavigationClient from '@/components/NavigationClient'
import Footer from '@/components/Footer'
import { SessionProvider } from '@/components/SessionProvider'
import { Toaster } from 'sonner'
import { GoogleTagManager } from '@next/third-parties/google'
import ClarityAnalytics from "@/components/ClarityAnalytics";


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
      <ClarityAnalytics clarityId="s1nwh9nqgu" />
      <GoogleTagManager gtmId="GTM-PT38FR9F" />
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SessionProvider>
          {/* Skip link for accessibility */}
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>
          <NavigationClient />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
