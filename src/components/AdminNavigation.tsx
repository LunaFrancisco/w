'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Settings, User, ExternalLink, LogOut, ChevronDown, UserPlus, ShoppingCart, Package, AlertTriangle, TrendingUp } from 'lucide-react'
import { useState } from 'react'

// Mock notifications for admin
const mockNotifications = [
  {
    id: 1,
    type: 'solicitud',
    icon: UserPlus,
    message: 'Nueva solicitud de acceso de María González',
    time: 'hace 5 min',
    priority: 'high',
    link: '/admin/solicitudes'
  },
  {
    id: 2,
    type: 'pedido',
    icon: ShoppingCart,
    message: '3 pedidos pendientes de procesamiento',
    time: 'hace 15 min',
    priority: 'high',
    link: '/admin/pedidos'
  },
  {
    id: 3,
    type: 'stock',
    icon: Package,
    message: '5 productos con stock bajo',
    time: 'hace 1 hora',
    priority: 'medium',
    link: '/admin/productos'
  },
  {
    id: 4,
    type: 'error',
    icon: AlertTriangle,
    message: 'Error en proceso de pago reportado',
    time: 'hace 2 horas',
    priority: 'high',
    link: '/admin/dashboard'
  },
  {
    id: 5,
    type: 'ventas',
    icon: TrendingUp,
    message: 'Ventas del día: $15,420 (+12%)',
    time: 'hace 3 horas',
    priority: 'medium',
    link: '/admin/reportes'
  }
]

export default function AdminNavigation() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  return (
    <header className="fixed top-0 right-0 z-40 p-4">
          {/* Right side - Quick actions and user menu */}
          <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative rounded-full">
                  <Bell className="w-4 h-4" />
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {mockNotifications.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificaciones</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {mockNotifications.length}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notification) => {
                    const IconComponent = notification.icon
                    const priorityColors = {
                      high: 'text-red-600 bg-red-50',
                      medium: 'text-yellow-600 bg-yellow-50',
                      low: 'text-gray-600 bg-gray-50'
                    }
                    
                    return (
                      <DropdownMenuItem key={notification.id} className="p-0">
                        <Link 
                          href={notification.link}
                          className="flex items-start gap-3 w-full p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className={`p-2 rounded-full ${priorityColors[notification.priority as keyof typeof priorityColors]}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {notification.priority === 'high' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            {session?.user && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 rounded-full"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {session.user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-20">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                          <p className="text-xs text-gray-500">{session.user.email}</p>
                        </div>
                        
                        <Link
                          href="/admin/configuracion"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Configuración
                        </Link>
                        
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ExternalLink className="w-4 h-4 mr-3" />
                          dashboard
                        </Link>
                        <Link
                          href="/"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ExternalLink className="w-4 h-4 mr-3" />
                          Ver sitio público
                        </Link>
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ExternalLink className="w-4 h-4 mr-3" />
                          Admin dashboard
                        </Link>
                        <Link
                          href="/productos"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ExternalLink className="w-4 h-4 mr-3" />
                          Ver catálogo
                        </Link>
                        
                        <div className="border-t">
                          <button
                            onClick={() => {
                              setShowUserMenu(false)
                              signOut({ callbackUrl: '/' })
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
    </header>
  )
}