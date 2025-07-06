'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { sendGTMEvent } from '@next/third-parties/google'

export interface CartItem {
  id: string
  productId: string
  productVariantId: string | null // null para venta individual
  variantName: string | null      // null para venta individual
  units: number                   // 1 para individual, variant.units para packs
  name: string
  price: number                   // precio base o precio de variante
  quantity: number
  image?: string
  slug: string
  stock: number
  isIndividual: boolean          // true si es venta individual
}

interface CartStore {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  isDrawerOpen: boolean
  
  // Actions
  addToCart: (productSlug: string, quantity?: number, variantId?: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  
  // Drawer actions
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemQuantity: (productId: string, variantId?: string) => number
  getItemById: (itemId: string) => CartItem | undefined
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      isDrawerOpen: false,

      addToCart: async (productSlug: string, quantity = 1, variantId?: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Fetch product details first to get current stock and variant info
          const response = await fetch(`/api/products/${productSlug}`)
          if (!response.ok) throw new Error('Producto no encontrado')
          
          const product = await response.json()
          
          // Determine if this is individual sale or variant
          const isIndividual = !variantId
          let variant = null
          let price = product.price
          let units = 1
          let variantName = null
          let availableStock = product.stock
          
          if (!isIndividual && variantId) {
            variant = product.variants?.find((v: any) => v.id === variantId)
            if (!variant) throw new Error('Variante no encontrada')
            
            price = variant.price
            units = variant.units
            variantName = variant.name
            availableStock = Math.floor(product.stock / units)
          }
          
          // Create unique item identifier
          const itemId = isIndividual ? `${product.id}-individual` : `${product.id}-${variantId}`
          
          // Check if item already exists in cart
          const existingItem = get().items.find(item => item.id === itemId)
          
          if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity
            
            // Check stock limit
            if (newQuantity > availableStock) {
              const stockMessage = isIndividual 
                ? `Solo hay ${availableStock} unidades disponibles`
                : `Solo hay ${availableStock} packs disponibles (${availableStock * units} unidades)`
              throw new Error(stockMessage)
            }
            
            set({
              items: get().items.map(item =>
                item.id === itemId
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            })
            
            const displayName = isIndividual ? product.name : `${product.name} - ${variantName}`
            sendGTMEvent({ event: 'add_to_cart', item_name: displayName });
          } else {
            // Check stock for new item
            if (quantity > availableStock) {
              const stockMessage = isIndividual 
                ? `Solo hay ${availableStock} unidades disponibles`
                : `Solo hay ${availableStock} packs disponibles (${availableStock * units} unidades)`
              throw new Error(stockMessage)
            }
            
            const newItem: CartItem = {
              id: itemId,
              productId: product.id,
              productVariantId: variantId || null,
              variantName,
              units,
              name: product.name,
              price,
              quantity,
              image: product.images?.[0],
              slug: product.slug,
              stock: availableStock,
              isIndividual,
            }
            
            set({
              items: [...get().items, newItem]
            })
            
            const displayName = isIndividual ? product.name : `${product.name} - ${variantName}`
            sendGTMEvent({ event: 'add_to_cart', item_name: displayName });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al agregar al carrito'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId)
          return
        }

        const item = get().items.find(item => item.id === itemId)
        if (!item) return

        // Check stock limit
        if (quantity > item.stock) {
          const stockMessage = item.isIndividual 
            ? `Solo hay ${item.stock} unidades disponibles`
            : `Solo hay ${item.stock} packs disponibles (${item.stock * item.units} unidades)`
          set({ error: stockMessage })
          return
        }

        set({
          items: get().items.map(cartItem =>
            cartItem.id === itemId
              ? { ...cartItem, quantity }
              : cartItem
          ),
          error: null
        })
      },

      removeFromCart: (itemId: string) => {
        set({
          items: get().items.filter(item => item.id !== itemId),
          error: null
        })
      },

      clearCart: () => {
        set({ items: [], error: null })
      },

      // Drawer actions
      openDrawer: () => {
        set({ isDrawerOpen: true })
      },

      closeDrawer: () => {
        set({ isDrawerOpen: false })
      },

      toggleDrawer: () => {
        set({ isDrawerOpen: !get().isDrawerOpen })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + (item.quantity * item.units), 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getItemQuantity: (productId: string, variantId?: string) => {
        const itemId = variantId ? `${productId}-${variantId}` : `${productId}-individual`
        const item = get().items.find(item => item.id === itemId)
        return item ? item.quantity : 0
      },

      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items 
      }), // Only persist items
    }
  )
)