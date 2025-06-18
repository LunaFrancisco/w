'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Users, Package, ShoppingCart, ClipboardList, TrendingUp, Clock, AlertTriangle } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  pendingUsers: number
  totalProducts: number
  lowStockProducts: number
  pendingRequests: number
  ordersToday: number
  revenueToday: number
  recentOrders: Array<{
    id: string
    total: number
    status: string
    user: {
      name: string
      email: string
    }
  }>
  recentRequests: Array<{
    id: string
    createdAt: string
    user: {
      name: string
      email: string
    }
  }>
  error?: string
  fallback?: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/dashboard')
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }
      
      const data = await response.json()
      setStats(data)
      
      if (data.fallback) {
        setError(data.error || 'Datos no disponibles temporalmente')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Error al cargar las estadísticas del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Resumen general del sistema y métricas clave
          </p>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
              <button 
                onClick={fetchStats}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Resumen general del sistema y métricas clave
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Warning Banner if using fallback data */}
      {stats.fallback && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p>Los datos mostrados son temporales. La base de datos no está disponible.</p>
              <button 
                onClick={fetchStats}
                className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsers}
          subtitle={`${stats.pendingUsers} pendientes`}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Pedidos Hoy"
          value={stats.ordersToday}
          subtitle={`$${stats.revenueToday.toLocaleString('es-CL')}`}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          subtitle={`${stats.lowStockProducts} con poco stock`}
          icon={<Package className="h-6 w-6" />}
          color="purple"
          warning={stats.lowStockProducts > 0}
        />
        <StatCard
          title="Solicitudes"
          value={stats.pendingRequests}
          subtitle="esperando aprobación"
          icon={<ClipboardList className="h-6 w-6" />}
          color="orange"
          warning={stats.pendingRequests > 0}
        />
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            Ingresos de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${stats.revenueToday.toLocaleString('es-CL')}
          </div>
          <p className="text-sm text-green-700 mt-1">
            {stats.ordersToday} pedidos realizados hoy
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={stats.recentOrders} />
        <PendingRequests requests={stats.recentRequests} />
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color, warning }: {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: string
  warning?: boolean
}) {
  const colorClasses = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
  const cardClass = warning 
    ? 'bg-red-50 border-red-200' 
    : `${colors.bg} ${colors.border}`

  return (
    <Card className={`${cardClass} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div className={warning ? 'text-red-600' : colors.text}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${warning ? 'text-red-600' : 'text-gray-900'}`}>
          {value.toLocaleString()}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}

function RecentOrders({ orders }: { orders: any[] }) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800' },
      PAID: { label: 'Pagado', className: 'bg-blue-100 text-blue-800' },
      PREPARING: { label: 'Preparando', className: 'bg-purple-100 text-purple-800' },
      SHIPPED: { label: 'Enviado', className: 'bg-indigo-100 text-indigo-800' },
      DELIVERED: { label: 'Entregado', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Pedidos Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No hay pedidos recientes</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-xs text-gray-600">{order.user.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">${Number(order.total).toLocaleString('es-CL')}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function PendingRequests({ requests }: { requests: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Solicitudes Pendientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-6">
            <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No hay solicitudes pendientes</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <p className="font-medium text-sm">{request.user.name}</p>
                <p className="text-xs text-gray-600">{request.user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">
                  {new Date(request.createdAt).toLocaleDateString('es-CL')}
                </p>
                <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  Pendiente
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}