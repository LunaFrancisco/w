'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { sendGTMEvent } from '@next/third-parties/google'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  slug: string
  stock: number
}

interface CartStore {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  isDrawerOpen: boolean
  
  // Actions
  addToCart: (productSlug: string, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  
  // Drawer actions
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemQuantity: (productId: string) => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      isDrawerOpen: false,

      addToCart: async (productSlug: string, quantity = 1) => {
        set({ isLoading: true, error: null })
        
        try {
          // Check if item already exists in cart
          const existingItem = get().items.find(item => item.slug === productSlug)
          
          if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity
            
            // Check stock limit
            if (newQuantity > existingItem.stock) {
              throw new Error(`Solo hay ${existingItem.stock} unidades disponibles`)
            }
            
            set({
              items: get().items.map(item =>
                item.slug === productSlug
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            })
            sendGTMEvent({ event: 'add_to_cart', item_name: existingItem.name });
          } else {
            // Fetch product details
            const response = await fetch(`/api/products/${productSlug}`)
            if (!response.ok) throw new Error('Producto no encontrado')
            
            const product = await response.json()
            
            // Check stock
            if (quantity > product.stock) {
              throw new Error(`Solo hay ${product.stock} unidades disponibles`)
            }
            
            const newItem: CartItem = {
              id: `${product.id}-${Date.now()}`, // Unique cart item ID
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              image: product.images?.[0],
              slug: product.slug,
              stock: product.stock,
            }
            
            set({
              items: [...get().items, newItem]
            })
            sendGTMEvent({ event: 'add_to_cart', item_name: product.name });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al agregar al carrito'
          set({ error: errorMessage })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        const item = get().items.find(item => item.productId === productId)
        if (!item) return

        // Check stock limit
        if (quantity > item.stock) {
          set({ error: `Solo hay ${item.stock} unidades disponibles` })
          return
        }

        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
          error: null
        })
      },

      removeFromCart: (productId: string) => {
        set({
          items: get().items.filter(item => item.productId !== productId),
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
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find(item => item.productId === productId)
        return item ? item.quantity : 0
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