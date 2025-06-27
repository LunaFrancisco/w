'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

interface SuccessHandlerProps {
  status?: string
  orderId?: string
}

export function SuccessHandler({ status, orderId }: SuccessHandlerProps) {
  const { clearCart } = useCart()

  useEffect(() => {
    // Solo limpiar el carrito si el pago fue exitoso
    if (status === 'approved' && orderId) {
      clearCart()
      console.log('Cart cleared after successful payment for order:', orderId)
    }
  }, [status, orderId, clearCart])

  // Este componente no renderiza nada
  return null
}