'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingBag, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: 'ADMIN' | 'CLIENT' | 'PENDING'
}

interface DashboardContentProps {
  user: User
}

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalSpent: number
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for now - in real app this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalOrders: 12,
        pendingOrders: 2,
        completedOrders: 10,
        totalSpent: 2450000
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80 bg-muted rounded-lg" />
              <div className="h-80 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              ¡Hola, {user.name?.split(' ')[0] || 'Miembro'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido de vuelta a tu dashboard de Club W
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" asChild>
              <Link href="/perfil">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total de Pedidos</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">En Proceso</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completados</p>
                  <p className="text-3xl font-bold text-green-900">{stats.completedOrders}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Gastado</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Pedidos Recientes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/pedidos">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock recent orders */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pedido #001234</p>
                    <p className="text-sm text-muted-foreground">iPhone 15 Pro Max + AirPods</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(1588000)}</p>
                  <p className="text-sm text-green-600">Entregado</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pedido #001235</p>
                    <p className="text-sm text-muted-foreground">MacBook Air M3</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(1650000)}</p>
                  <p className="text-sm text-blue-600">En camino</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pedido #001236</p>
                    <p className="text-sm text-muted-foreground">Zapatillas Nike Jordan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(180000)}</p>
                  <p className="text-sm text-orange-600">Preparando</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-primary" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start h-auto p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 hover:from-emerald-100 hover:to-teal-100">
                <Link href="/productos">
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Explorar Productos</p>
                    <p className="text-sm opacity-70">Descubre nuevos productos exclusivos</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                <Link href="/carrito">
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Ver Carrito</p>
                    <p className="text-sm text-muted-foreground">Revisar productos guardados</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                <Link href="/perfil/direcciones">
                  <MapPin className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Gestionar Direcciones</p>
                    <p className="text-sm text-muted-foreground">Agregar o editar direcciones de envío</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start h-auto p-4">
                <Link href="/perfil">
                  <Settings className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Configurar Perfil</p>
                    <p className="text-sm text-muted-foreground">Actualizar información personal</p>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Member Benefits */}
        <Card className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                  🎉 Beneficios de Miembro {user.role === 'ADMIN' ? 'Admin' : 'Premium'}
                </h3>
                <p className="text-emerald-700">
                  Aprovecha al máximo tu membresía con descuentos exclusivos, envío gratis y acceso prioritario.
                </p>
              </div>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/productos">
                  Comprar Ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}