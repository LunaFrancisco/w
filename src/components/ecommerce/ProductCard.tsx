'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { Package2 } from 'lucide-react'

interface ProductVariant {
  id: string
  name: string
  units: number
  price: number
  active: boolean
  isDefault: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  images: string
  featured: boolean
  allowIndividualSale: boolean
  category: {
    id: string
    name: string
    slug: string
  }
  variants?: ProductVariant[]
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addToCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.stock === 0) return

    // Si no se permite venta individual O hay variantes, redirigir a la página del producto
    if (!product.allowIndividualSale || (product.variants && product.variants.length > 0)) {
      window.location.href = `/productos/${product.slug}`
      return
    }

    setIsLoading(true)
    try {
      await addToCart(product.slug, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriceRange = () => {
    // Si no hay variantes, mostrar precio base (solo si se permite venta individual)
    if (!product.variants || product.variants.length === 0) {
      return formatPrice(product.price)
    }

    const activeVariants = product.variants.filter(v => v.active)
    
    // Si no se permite venta individual, solo considerar precios de variantes
    if (!product.allowIndividualSale) {
      if (activeVariants.length === 0) {
        return formatPrice(product.price) // fallback
      }
      
      const variantPrices = activeVariants.map(v => v.price)
      const minPrice = Math.min(...variantPrices)
      const maxPrice = Math.max(...variantPrices)
      
      if (minPrice === maxPrice) {
        return formatPrice(minPrice)
      }
      
      return `Desde ${formatPrice(minPrice)}`
    }

    // Si se permite venta individual, incluir precio base + variantes
    const allPrices = [product.price, ...activeVariants.map(v => v.price)]
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)

    if (minPrice === maxPrice) {
      return formatPrice(minPrice)
    }

    return `Desde ${formatPrice(minPrice)}`
  }

  return (
    <Link href={`/productos/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                Destacado
              </span>
            </div>
          )}

          {/* Stock badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category and Variants indicator */}
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">
              {product.category.name}
            </div>
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                <Package2 className="h-3 w-3" />
                Múltiples formatos
              </div>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Price and Stock */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-gray-900">
              {getPriceRange()}
            </div>
            <div className="text-sm text-gray-500">
              Stock: {product.stock}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Agregando...
              </div>
            ) : product.stock === 0 ? (
              'Producto Agotado'
            ) : !product.allowIndividualSale || (product.variants && product.variants.length > 0) ? (
              'Ver Opciones'
            ) : (
              'Agregar al Carrito'
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}