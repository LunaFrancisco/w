'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'

export function CartContent() {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalItems, 
    getTotalPrice,
    error 
  } = useCart()
  
  const [isClient, setIsClient] = useState(false)
  const [shippingCost, setShippingCost] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-gray-400 mb-6">
          <ShoppingBag className="mx-auto h-16 w-16" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
        <p className="text-gray-600 mb-6">¡Agrega algunos productos increíbles para comenzar!</p>
        <Button asChild className="gradient-green text-white">
          <Link href="/productos">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explorar Productos
          </Link>
        </Button>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const total = subtotal + shippingCost

  return (
    <div className="max-w-6xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Productos ({getTotalItems()} {getTotalItems() === 1 ? 'artículo' : 'artículos'})
              </h2>
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Vaciar carrito
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Link href={`/productos/${item.slug}`}>
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/productos/${item.slug}`}>
                      <h3 className="font-medium text-gray-900 hover:text-blue-600 truncate">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Stock disponible: {item.stock}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium">
                  {shippingCost > 0 ? formatPrice(shippingCost) : 'A calcular'}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full gradient-green text-white"
                size="lg"
                asChild
              >
                <Link href="/checkout">
                  Proceder al Pago
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <Link href="/productos">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continuar Comprando
                </Link>
              </Button>
            </div>

            {/* Security badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Compra 100% segura
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Garantía de satisfacción
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}