"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/nuestra-historia", label: "Nuestra Historia" },
  { href: "/contacto", label: "Contacto" },
  { href: "/pedidos", label: "Pedidos" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession()

  return (
    <>
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-fit lg:w-full max-w-3xl px-4">
        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-full p-3 flex items-center justify-between">
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 gradient-green rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">Club W</span>
          </Link>

          <nav className="hidden md:flex md:space-x-4 lg:space-x-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-stone-700 hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block md:ml-4 lg:ml-6">
            <Button
              asChild
              className="bg-stone-900 text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-emerald-700"
            >
              <Link href="/productos">Explorar</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-stone-700" />
              ) : (
                <Menu className="h-6 w-6 text-stone-700" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-24 bg-white/95 backdrop-blur-md z-40 p-6">
          <nav className="flex flex-col space-y-4 items-center text-center">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-stone-700 hover:text-emerald-600 transition-colors w-full hover:bg-stone-100 rounded-md"
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              className="bg-stone-900 md:ml-2 lg:ml-0 text-white rounded-full px-8 py-3 text-base font-semibold hover:bg-emerald-700 mt-6 w-full max-w-xs"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/productos">Explorar</Link>
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}
