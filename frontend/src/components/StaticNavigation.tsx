import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Users } from 'lucide-react'

export default function StaticNavigation() {
  return (
    <nav 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 focus-visible:focus-visible"
            aria-label="Club W - Ir al inicio"
          >
            <div className="w-8 h-8 gradient-green rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl text-gradient">Club W</span>
          </Link>

          {/* Desktop Navigation - Static version */}
          <div className="hidden md:flex items-center space-x-8" role="menubar">
            <Link 
              href="/" 
              className="font-medium text-foreground hover:text-primary transition-colors duration-200 focus-visible:focus-visible"
              role="menuitem"
            >
              Inicio
            </Link>
            <Link 
              href="/contacto" 
              className="font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:focus-visible"
              role="menuitem"
            >
              Contacto
            </Link>
            <Link 
              href="/solicitud-acceso" 
              className="font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:focus-visible"
              role="menuitem"
            >
              Solicitar Acceso
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin" aria-label="Iniciar sesión en tu cuenta">
                  <Users className="w-4 h-4 mr-2" aria-hidden="true" />
                  Iniciar Sesión
                </Link>
              </Button>
              <Button size="sm" asChild className="gradient-green text-white border-0">
                <Link href="/solicitud-acceso" aria-label="Solicitar membresía en Club W">
                  Unirse al Club
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">
                  Acceso
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}