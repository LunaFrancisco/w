'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    getTotalItems, 
    getTotalPrice,
    error 
  } = useCart()
  
  const [isClient, setIsClient] = useState(false)

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
    return null
  }

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-lg flex flex-col transform transition-transform duration-300 ease-out"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-right-5 duration-300">
            <ShoppingBag className="w-5 h-5" />
            Carrito ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
          </SheetTitle>
        </SheetHeader>        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md animate-in fade-in-0 duration-300">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in-0 slide-in-from-right-10 duration-500">
              <div className="text-gray-400 mb-4">
                <ShoppingBag className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-600 mb-4">¡Agrega algunos productos increíbles!</p>
              <Button
                onClick={() => onOpenChange(false)}
                className="gradient-green text-white"
                asChild
              >
                <Link href="/productos">
                  Explorar Productos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg animate-in fade-in-0 slide-in-from-right-5 duration-300"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Link href={`/productos/${item.slug}`} onClick={() => onOpenChange(false)}>
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/productos/${item.slug}`} 
                      onClick={() => onOpenChange(false)}
                      className="block"
                    >
                      <h4 className="font-medium text-gray-900 hover:text-blue-600 truncate text-sm">
                        {item.name}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatPrice(item.price)}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xs"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-700 p-1 ml-2"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>        {/* Footer with total and actions */}
        {items.length > 0 && (
          <SheetFooter className="border-t pt-4 animate-in fade-in-0 slide-in-from-bottom-5 duration-400">
            <div className="w-full space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  className="w-full gradient-green text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                  asChild
                  onClick={() => onOpenChange(false)}
                >
                  <Link href="/checkout">
                    Proceder al Pago
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                  asChild
                  onClick={() => onOpenChange(false)}
                >
                  <Link href="/productos">
                    Seguir Comprando
                  </Link>
                </Button>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center text-xs text-gray-600 pt-2">
                <svg className="w-3 h-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Compra 100% segura
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}