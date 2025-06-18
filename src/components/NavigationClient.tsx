'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingBag, Users, ShoppingCart, User, LogOut, Settings } from 'lucide-react'
import { CartCounter } from '@/components/ecommerce/CartCounter'
import { CartDrawer } from '@/components/ecommerce/CartDrawer'
import { useCart } from '@/hooks/useCart'

export default function NavigationClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isDrawerOpen, openDrawer, closeDrawer } = useCart()

  // Navigation items for public pages
  const publicNavItems = [
    { href: '/', label: 'Inicio' },
    { href: '/contacto', label: 'Contacto' },
    { href: '/solicitud-acceso', label: 'Solicitar Acceso' },
  ]

  // Navigation items for authenticated users
  const authNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/productos', label: 'Productos' },
    { href: '/pedidos', label: 'Mis Pedidos' },
  ]

  // Admin navigation items
  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Admin' },
  ]

  const navItems = session ? authNavItems : publicNavItems
  const isActive = (href: string) => pathname === href

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-green rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">Club W</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors duration-200 relative ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Admin link for admin users */}
            {session?.user?.role === 'ADMIN' && adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Auth buttons */}
            <div className="flex items-center space-x-3">
              {session ? (
                <div className="flex items-center space-x-3">
                  {/* Cart button for authenticated users */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={openDrawer}
                    className="relative"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <CartCounter />
                  </Button>
                  
                  {/* User menu */}
                  <div className="relative group">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-20 truncate">{session.user?.name}</span>
                    </Button>
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border">
                      <div className="py-1">
                        <Link
                          href="/perfil"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Mi Perfil
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/signin">
                      <Users className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="gradient-green text-white border-0">
                    <Link href="/solicitud-acceso">
                      Unirse al Club
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-accent"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 relative ${
                  isActive(item.href)
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Admin link for mobile */}
            {session?.user?.role === 'ADMIN' && adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 space-y-3 border-t border-border">
              {session ? (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      openDrawer()
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Carrito
                    <CartCounter />
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </Button>
                  <Button
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleSignOut()
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Users className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button className="w-full gradient-green text-white border-0" asChild>
                    <Link href="/solicitud-acceso" onClick={() => setIsMobileMenuOpen(false)}>
                      Unirse al Club
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer open={isDrawerOpen} onOpenChange={closeDrawer} />
    </nav>
  )
}