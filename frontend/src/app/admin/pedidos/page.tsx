  import { auth } from '@/lib/auth'
  import { redirect } from 'next/navigation'
  import { prisma } from '@/lib/prisma'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Badge } from '@/components/ui/badge'
  import OrderStatusActions from '@/components/OrderStatusActions'
  import Link from 'next/link'

  export default async function OrdersManagementPage() {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      redirect('/auth/unauthorized')
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        address: true,
        items: {
          include: {
            product: { select: { name: true, images: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const orderStats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      paid: orders.filter(o => o.status === 'PAID').length,
      preparing: orders.filter(o => o.status === 'PREPARING').length,
      shipped: orders.filter(o => o.status === 'SHIPPED').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    }

    const totalRevenue = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, order) => sum + Number(order.total), 0)

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600 mt-2">
            Administra todos los pedidos del sistema
          </p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard title="Total" value={orderStats.total} color="gray" />
          <StatCard title="Pendientes" value={orderStats.pending} color="orange" />
          <StatCard title="Pagados" value={orderStats.paid} color="blue" />
          <StatCard title="Preparando" value={orderStats.preparing} color="purple" />
          <StatCard title="Enviados" value={orderStats.shipped} color="indigo" />
          <StatCard title="Entregados" value={orderStats.delivered} color="green" />
          <StatCard title="Cancelados" value={orderStats.cancelled} color="red" />
        </div>

        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Excluyendo pedidos cancelados
            </p>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay pedidos en el sistema
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  function StatCard({ title, value, color }: {
    title: string
    value: number
    color: string
  }) {
    const colorClasses = {
      gray: 'text-gray-600',
      orange: 'text-orange-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
      green: 'text-green-600',
      red: 'text-red-600',
    }

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-gray-600">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-lg font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
            {value}
          </div>
        </CardContent>
      </Card>
    )
  }

  function OrderCard({ order }: { order: any }) {
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
        <Badge variant="secondary" className={config.className}>
          {config.label}
        </Badge>
      )
    }

    return (
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">
                Pedido #{order.id.slice(-8)}
              </h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {order.user.name} - {order.user.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">${Number(order.total).toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Dirección de envío:</h4>
            <p className="text-gray-600">
              {order.address.street}<br />
              {order.address.commune}, {order.address.city}<br />
              {order.address.region} - {order.address.zipCode}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Detalles del pedido:</h4>
            <p className="text-gray-600">
              Subtotal: ${Number(order.subtotal).toLocaleString()}<br />
              Envío: ${Number(order.shippingCost).toLocaleString()}<br />
              <span className="font-medium">Total: ${Number(order.total).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Productos ({order.items.length}):</h4>
          <div className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex items-center space-x-3">
                  {item.product.images && item.product.images[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-sm">${Number(item.total).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {order.mercadopagoId && (
          <div className="text-xs text-gray-500">
            MercadoPago ID: {order.mercadopagoId}
          </div>
        )}

        <OrderStatusActions orderId={order.id} currentStatus={order.status} />
      </div>
    )
  }