'use client'

import { useCart } from '@/hooks/useCart'
import { useEffect, useState } from 'react'

export function CartCounter() {
  const { items, getTotalItems } = useCart()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const cartItemsCount = getTotalItems()

  if (cartItemsCount === 0) {
    return null
  }

  return (
    <span className="absolute -top-2 -right-2 md:top-0 md:right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {cartItemsCount > 99 ? '99+' : cartItemsCount}
    </span>
  )
}