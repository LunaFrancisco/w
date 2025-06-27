'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Address {
  id: string
  name: string
  street: string
  commune: string
  city: string
  region: string
  zipCode: string
  phone: string
  isDefault: boolean
}

export function CheckoutContent() {
  const { items, getTotalPrice } = useCart()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [shippingCost, setShippingCost] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  useEffect(() => {
    if (selectedAddress) {
      fetchShippingCost()
    }
  }, [selectedAddress])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses')
      if (!response.ok) throw new Error('Error al cargar direcciones')
      
      const data = await response.json()
      setAddresses(data)
      
      // Select default address
      const defaultAddress = data.find((addr: Address) => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id)
      }
    } catch (error) {
      setError('Error al cargar las direcciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchShippingCost = async () => {
    try {
      const address = addresses.find(addr => addr.id === selectedAddress)
      if (!address) return

      const response = await fetch(`/api/shipping/calculate?commune=${encodeURIComponent(address.commune)}`)
      if (!response.ok) throw new Error('Error al calcular envío')
      
      const data = await response.json()
      setShippingCost(Number(data.cost))
    } catch (error) {
      console.error('Error calculating shipping:', error)
      setShippingCost(5000) // Default shipping cost
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError('Debes seleccionar una dirección de entrega')
      return
    }

    if (items.length === 0) {
      setError('Tu carrito está vacío')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          addressId: selectedAddress,
          shippingCost: shippingCost,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar el pago')
      }

      const { init_point } = await response.json()
      
      // Redirect to MercadoPago CheckoutPro
      const paymentUrl = init_point
      window.location.href = paymentUrl

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-lg text-gray-600 mb-4">Tu carrito está vacío</p>
        <Button asChild>
          <Link href="/productos">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a productos
          </Link>
        </Button>
      </div>
    )
  }

  const subtotal = Number(getTotalPrice())
  const total = subtotal + shippingCost

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Order details and shipping */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Resumen del Pedido
            </h2>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Dirección de Entrega
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/perfil/direcciones">
                  Gestionar direcciones
                </Link>
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No tienes direcciones registradas</p>
                <Button asChild>
                  <Link href="/perfil/direcciones">
                    Agregar dirección
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label key={address.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900">{address.name}</p>
                        {address.isDefault && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {address.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.commune}, {address.city}, {address.region}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.phone}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Payment */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Método de Pago
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Pago seguro con MercadoPago
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Acepta tarjetas de crédito, débito y transferencias bancarias
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Transacción 100% segura
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Protección al comprador
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleCheckout}
              disabled={submitting || !selectedAddress || addresses.length === 0}
              className="w-full gradient-green text-white"
              size="lg"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Procesando...
                </div>
              ) : (
                `Pagar ${formatPrice(total)}`
              )}
            </Button>
            
            <Button variant="outline" className="w-full" asChild>
              <Link href="/carrito">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al carrito
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="text-center text-xs text-gray-500">
            <p>Al proceder al pago aceptas nuestros</p>
            <p>
              <Link href="/terminos" className="text-blue-600 hover:underline">
                Términos y Condiciones
              </Link>
              {' y '}
              <Link href="/privacidad" className="text-blue-600 hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}