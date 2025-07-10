import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "@/components/ConditionalNavigation";
import Footer from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import { Toaster } from "sonner";
import { GoogleTagManager } from "@next/third-parties/google";
import ClarityAnalytics from "@/components/ClarityAnalytics";
import ConditionalFloatingButtons from "@/components/ConditionalFloatingButtons";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Club W - Tu Club Privado de Compras Exclusivas",
  description:
    "Club W es tu club privado de compras exclusivas con acceso a productos premium y precios especiales solo para miembros verificados.",
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
          {/* Conditional floating buttons based on user role */}
          <ConditionalFloatingButtons />
          
          <ConditionalNavigation />
          <main id="main-content" className="flex-1 bg-gray-50">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
