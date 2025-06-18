import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OrderStepper } from '@/components/ui/stepper'
import { OrderStatusSelect } from '@/components/orders/OrderStatusSelect'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }
  console.log('Fetching order details for ID:', id)
  const order = await prisma.order.findFirst({
    where: {
      id: id,
      // Non-admin users can only see their own orders
      ...(session.user.role !== 'ADMIN' && { userId: session.user.id })
    },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: {
        include: {
          product: { 
            select: { 
              name: true, 
              images: true, 
              slug: true 
            } 
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

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

  const getStatusDescription = (status: string) => {
    const descriptions = {
      PENDING: 'Tu pedido está pendiente de pago. Por favor, completa el pago para procesar tu orden.',
      PAID: 'Hemos recibido tu pago. Tu pedido será preparado pronto.',
      PREPARING: 'Estamos preparando tu pedido. Te notificaremos cuando esté listo para envío.',
      SHIPPED: 'Tu pedido ha sido enviado. Recibirás la información de seguimiento por email.',
      DELIVERED: '¡Tu pedido ha sido entregado! Esperamos que disfrutes tus productos.',
      CANCELLED: 'Este pedido ha sido cancelado. Si tienes preguntas, contáctanos.',
    }

    return descriptions[status as keyof typeof descriptions] || 'Estado del pedido actualizado.'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pedido #{order.id.slice(-8)}
          </h1>
          <p className="text-gray-600 mt-2">
            Realizado el {new Date(order.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="text-right">
          {getStatusBadge(order.status)}
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ${Number(order.total).toLocaleString()}
          </p>
        </div>
      </div>

      {session.user.role === 'ADMIN' && (
        <div className="mt-6 flex justify-center">
          <OrderStatusSelect 
            orderId={order.id}
            currentStatus={order.status}
          />
        </div>
      )}
      {/* Order Status Stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStepper currentStatus={order.status} className="mb-6" />
          <p className="text-gray-700 text-center">
            {getStatusDescription(order.status)}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>${Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío:</span>
              <span>${Number(order.shippingCost).toLocaleString()}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${Number(order.total).toLocaleString()}</span>
            </div>
            
            {order.mercadopagoId && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  ID de pago: {order.mercadopagoId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Dirección de Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700">
              <p className="font-medium">{order.address.name}</p>
              <p>{order.address.street}</p>
              <p>{order.address.commune}, {order.address.city}</p>
              <p>{order.address.region} - {order.address.zipCode}</p>
              {order.address.phone && (
                <p className="mt-2">Teléfono: {order.address.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Productos ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {item.product.images && item.product.images[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      <Link 
                        href={`/productos/${item.product.slug}`}
                        className="hover:text-orange-600"
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Precio unitario: ${Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">
                    ${Number(item.total).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/pedidos">
            ← Volver a Mis Pedidos
          </Link>
        </Button>
        
        {order.status === 'DELIVERED' && (
          <Button asChild>
            <Link href="/productos">
              Comprar de Nuevo
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}