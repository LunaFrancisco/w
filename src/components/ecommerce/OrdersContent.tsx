'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, MapPin, Calendar, CreditCard, ShoppingBag, Eye, Package2 } from 'lucide-react'
import { OrderStatusSelect } from '@/components/orders/OrderStatusSelect'
import { useSession } from 'next-auth/react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  total: number
  productVariantId: string | null
  product: {
    id: string
    name: string
    slug: string
    images: string
  }
  productVariant?: {
    id: string
    name: string
    units: number
    price: number
  } | null
}

interface Order {
  id: string
  status: string
  subtotal: number
  shippingCost: number
  total: number
  paymentStatus: string
  createdAt: string
  updatedAt: string
  address: {
    name: string
    street: string
    commune: string
    city: string
    region: string
    phone: string
  }
  items: OrderItem[]
}


export function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/orders')
      if (!response.ok) throw new Error('Error al cargar pedidos')
      
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-blue-100 text-blue-800'
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'PAID':
        return 'Pagado'
      case 'PREPARING':
        return 'Preparando'
      case 'SHIPPED':
        return 'Enviado'
      case 'DELIVERED':
        return 'Entregado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Package className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar pedidos</h3>
        <p className="text-gray-600">{error}</p>
        <Button onClick={fetchOrders} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-6">
          <ShoppingBag className="mx-auto h-16 w-16" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes pedidos aún</h3>
        <p className="text-gray-600 mb-6">¡Explora nuestros productos y realiza tu primera compra!</p>
        <Button asChild className="gradient-green text-white">
          <Link href="/productos">
            Explorar Productos
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Order Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.product.slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {item.product.name}
                    </Link>
                    
                    {/* Variant Information */}
                    {item.productVariantId && item.productVariant && (
                      <div className="flex items-center gap-1 mt-1">
                        <Package2 className="h-3 w-3 text-purple-600" />
                        <span className="text-sm text-purple-600 font-medium">
                          {item.productVariant.name} ({item.productVariant.units} unidades)
                        </span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mt-1">
                      {item.productVariantId ? (
                        <span>
                          Cantidad: {item.quantity} packs ({item.quantity * (item.productVariant?.units || 1)} unidades) × {formatPrice(item.price)}
                        </span>
                      ) : (
                        <span>
                          Cantidad: {item.quantity} unidades × {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipping Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Dirección de Entrega
                </h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{order.address.name}</p>
                  <p>{order.address.street}</p>
                  <p>{order.address.commune}, {order.address.city}</p>
                  <p>{order.address.region}</p>
                  <p>{order.address.phone}</p>
                </div>
              </div>

              {/* Order Totals */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Resumen</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío:</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-gray-200">
                    <span>Total:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="text-sm text-gray-600">
                Última actualización: {formatDate(order.updatedAt)}
              </div>
              
              <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row gap-2">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/pedidos/${order.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalles
                    </Link>
                  </Button>
                  
                  {order.status === 'DELIVERED' && (
                    <Button variant="outline" size="sm">
                      Volver a comprar
                    </Button>
                  )}
                </div>
                
                {session?.user?.role === 'ADMIN' && (
                  <div className="mt-2 sm:mt-0">
                    <OrderStatusSelect 
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}