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

interface RecentOrder {
  id: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    product: {
      name: string
    }
  }>
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserStats()
    fetchRecentOrders()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (!response.ok) throw new Error('Error al cargar estadísticas')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0
      })
    }
  }

  const fetchRecentOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/orders?limit=3')
      if (!response.ok) throw new Error('Error al cargar pedidos')
      
      const data = await response.json()
      setRecentOrders(data)
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      setRecentOrders([])
    } finally {
      setIsLoading(false)
    }
  }

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
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes pedidos recientes</p>
                  <Button asChild className="mt-3" size="sm">
                    <Link href="/productos">Explorar productos</Link>
                  </Button>
                </div>
              ) : (
                recentOrders.map((order) => {
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case 'DELIVERED':
                        return <CheckCircle className="w-5 h-5 text-green-600" />
                      case 'SHIPPED':
                        return <Truck className="w-5 h-5 text-blue-600" />
                      case 'PREPARING':
                        return <Package className="w-5 h-5 text-purple-600" />
                      case 'PAID':
                        return <CheckCircle className="w-5 h-5 text-blue-600" />
                      default:
                        return <Clock className="w-5 h-5 text-orange-600" />
                    }
                  }

                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'DELIVERED': return 'Entregado'
                      case 'SHIPPED': return 'En camino'
                      case 'PREPARING': return 'Preparando'
                      case 'PAID': return 'Pagado'
                      case 'PENDING': return 'Pendiente'
                      default: return status
                    }
                  }

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'DELIVERED': return 'text-green-600'
                      case 'SHIPPED': return 'text-blue-600'
                      case 'PREPARING': return 'text-purple-600'
                      case 'PAID': return 'text-blue-600'
                      default: return 'text-orange-600'
                    }
                  }

                  const getBgColor = (status: string) => {
                    switch (status) {
                      case 'DELIVERED': return 'bg-green-100'
                      case 'SHIPPED': return 'bg-blue-100'
                      case 'PREPARING': return 'bg-purple-100'
                      case 'PAID': return 'bg-blue-100'
                      default: return 'bg-orange-100'
                    }
                  }

                  const productNames = order.items.map(item => item.product.name).join(', ')
                  const shortProductNames = productNames.length > 40 
                    ? productNames.substring(0, 40) + '...' 
                    : productNames

                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getBgColor(order.status)} rounded-full flex items-center justify-center`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="font-medium">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground" title={productNames}>
                            {shortProductNames}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <p className={`text-sm ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
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

              {user.role === 'ADMIN' && (
                <Button asChild className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 hover:from-blue-100 hover:to-indigo-100">
                  <Link href="/admin/dashboard">
                    <Settings className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Panel de Administración</p>
                      <p className="text-sm opacity-70">Gestionar usuarios, productos y pedidos</p>
                    </div>
                  </Link>
                </Button>
              )}

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