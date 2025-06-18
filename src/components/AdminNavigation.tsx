'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminNavigation() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Club W Admin
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/admin/dashboard"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/usuarios"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Usuarios
            </Link>
            <Link 
              href="/admin/productos"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Productos
            </Link>
            <Link 
              href="/admin/pedidos"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Pedidos
            </Link>
            <Link 
              href="/admin/solicitudes"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Solicitudes
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <span className="text-sm text-gray-700">
                  {session.user.name}
                </span>
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                  Ver sitio
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Cerrar sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}