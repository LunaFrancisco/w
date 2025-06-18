'use client'

import { useCart } from '@/hooks/useCart'
import { useEffect, useState } from 'react'

export function CartCounter() {
  const { getTotalItems } = useCart()
  const [isClient, setIsClient] = useState(false)
  const [cartItemsCount, setCartItemsCount] = useState(0)

  useEffect(() => {
    setIsClient(true)
    setCartItemsCount(getTotalItems())
  }, [getTotalItems])

  if (!isClient) {
    return null
  }

  if (cartItemsCount === 0) {
    return null
  }

  return (
    <span className="absolute -top-2 -right-2 md:top-5 md:right-5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {cartItemsCount > 99 ? '99+' : cartItemsCount}
    </span>
  )
}