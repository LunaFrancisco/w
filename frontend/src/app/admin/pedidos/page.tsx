'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter, TrendingUp, Clock, CheckCircle, Truck, Package, XCircle, Eye, BarChart3, RefreshCw } from 'lucide-react'

interface Order {
  id: string
  status: string
  total: number
  subtotal: number
  shippingCost: number
  createdAt: string
  mercadopagoId?: string
  user: {
    id: string
    name: string
    email: string
  }
  address: {
    street: string
    commune: string
    city: string
    region: string
    zipCode: string
  }
  items: Array<{
    id: string
    quantity: number
    total: number
    product: {
      name: string
      images: string[]
    }
  }>
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('desc')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = [...orders]

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortBy === 'asc' ? dateA - dateB : dateB - dateA
    })

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, sortBy])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const orderStats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'PENDING').length,
    paid: filteredOrders.filter(o => o.status === 'PAID').length,
    preparing: filteredOrders.filter(o => o.status === 'PREPARING').length,
    shipped: filteredOrders.filter(o => o.status === 'SHIPPED').length,
    delivered: filteredOrders.filter(o => o.status === 'DELIVERED').length,
    cancelled: filteredOrders.filter(o => o.status === 'CANCELLED').length,
  }

  const totalRevenue = filteredOrders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, order) => sum + Number(order.total), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Gestión de Pedidos
          </h1>
          <p className="text-gray-600 mt-2">
            Administra todos los pedidos del sistema
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total de pedidos</p>
          <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <OrderFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onRefresh={fetchOrders}
      />

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard 
          title="Total" 
          value={orderStats.total} 
          color="gray" 
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard 
          title="Pendientes" 
          value={orderStats.pending} 
          color="orange" 
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard 
          title="Pagados" 
          value={orderStats.paid} 
          color="blue" 
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard 
          title="Preparando" 
          value={orderStats.preparing} 
          color="purple" 
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard 
          title="Enviados" 
          value={orderStats.shipped} 
          color="indigo" 
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard 
          title="Entregados" 
          value={orderStats.delivered} 
          color="green" 
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard 
          title="Cancelados" 
          value={orderStats.cancelled} 
          color="red" 
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            Ingresos Totales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${totalRevenue.toLocaleString('es-CL')}
          </div>
          <p className="text-sm text-green-700 mt-1">
            Excluyendo pedidos cancelados • {filteredOrders.filter(o => o.status !== 'CANCELLED').length} pedidos activos
          </p>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Pedidos ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || (statusFilter && statusFilter !== 'all') ? 'No se encontraron pedidos con los filtros aplicados' : 'No hay pedidos en el sistema'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OrderFilters({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  sortBy, 
  setSortBy,
  onRefresh 
}: {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  onRefresh: () => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Buscar pedidos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ID, nombre o email del cliente..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Estado
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="PREPARING">Preparando</SelectItem>
                <SelectItem value="SHIPPED">Enviado</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-40">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ordenar
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Más recientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Más recientes</SelectItem>
                <SelectItem value="asc">Más antiguos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, color, icon }: {
  title: string
  value: number
  color: string
  icon?: React.ReactNode
}) {
  const colorClasses = {
    gray: { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.gray

  return (
    <Card className={`${colors.bg} ${colors.border} hover:shadow-md transition-shadow cursor-pointer`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colors.text}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function OrderCard({ order }: { order: Order }) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      PAID: { label: 'Pagado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      PREPARING: { label: 'Preparando', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      SHIPPED: { label: 'Enviado', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      DELIVERED: { label: 'Entregado', className: 'bg-green-100 text-green-800 border-green-200' },
      CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-200' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' }

    return (
      <Badge variant="secondary" className={`${config.className} border font-medium`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="border rounded-xl p-6 space-y-6 hover:shadow-lg transition-all bg-white border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              Pedido #{order.id.slice(-8)}
            </h3>
            {getStatusBadge(order.status)}
            <Button variant="ghost" size="sm" className="ml-auto hover:bg-gray-100">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{order.user.name}</span>
            <span>•</span>
            <span>{order.user.email}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-gray-900">${Number(order.total).toLocaleString('es-CL')}</p>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg text-sm">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Dirección de envío
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {order.address.street}<br />
            {order.address.commune}, {order.address.city}<br />
            {order.address.region} - {order.address.zipCode}
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Detalles del pedido
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${Number(order.subtotal).toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío:</span>
              <span className="font-medium">${Number(order.shippingCost).toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-2">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg">${Number(order.total).toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Productos ({order.items.length})
        </h4>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                {item.product.images && item.product.images[0] && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-600">Cantidad: <span className="font-medium">{item.quantity}</span></p>
                </div>
              </div>
              <p className="font-bold text-sm text-gray-900">${Number(item.total).toLocaleString('es-CL')}</p>
            </div>
          ))}
        </div>
      </div>

      {order.mercadopagoId && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          MercadoPago ID: {order.mercadopagoId}
        </div>
      )}

      <div className="pt-2 border-t">
        {/* OrderStatusActions component would go here */}
      </div>
    </div>
  )
}