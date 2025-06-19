'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, Share2, Star, StarIcon, Truck, Shield, RotateCcw } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  images: string[]
  featured: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

interface ProductDetailContentProps {
  product: Product
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = async () => {
    if (product.stock === 0) return

    setIsLoading(true)
    try {
      await addToCart(product.id, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg']

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/productos" className="flex items-center hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Productos
        </Link>
        <span>/</span>
        <Link href={`/productos?category=${product.category.slug}`} className="hover:text-blue-600 transition-colors">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
            <Image
              src={images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.featured && (
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                  ⭐ Destacado
                </span>
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-600 text-white text-lg font-bold px-4 py-2 rounded-lg">
                  AGOTADO
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          <Link 
            href={`/productos?category=${product.category.slug}`}
            className="inline-block text-blue-600 hover:text-blue-700 font-medium text-sm uppercase tracking-wide"
          >
            {product.category.name}
          </Link>

          {/* Product Name */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-600 ml-2">(4.8 · 127 reseñas)</span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="text-3xl lg:text-4xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-gray-600">
              Precio exclusivo para miembros
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {product.stock > 0 ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">
                  En stock ({product.stock} disponibles)
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">Agotado</span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Cantidad
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg ${
                product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 active:scale-95'
              } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Agregando al carrito...
                </div>
              ) : product.stock === 0 ? (
                'Producto Agotado'
              ) : (
                `Agregar al carrito · ${formatPrice(product.price * quantity)}`
              )}
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  isFavorite
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 inline ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
              </button>
              
              <button
                onClick={handleShare}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors"
              >
                <Share2 className="h-5 w-5 mr-2 inline" />
                Compartir
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
            <div className="text-center space-y-2">
              <Truck className="h-8 w-8 text-blue-600 mx-auto" />
              <div className="text-sm font-medium text-gray-900">Envío gratuito</div>
              <div className="text-xs text-gray-600">En pedidos +$50.000</div>
            </div>
            <div className="text-center space-y-2">
              <Shield className="h-8 w-8 text-green-600 mx-auto" />
              <div className="text-sm font-medium text-gray-900">Compra segura</div>
              <div className="text-xs text-gray-600">Protección garantizada</div>
            </div>
            <div className="text-center space-y-2">
              <RotateCcw className="h-8 w-8 text-purple-600 mx-auto" />
              <div className="text-sm font-medium text-gray-900">30 días</div>
              <div className="text-xs text-gray-600">Devolución gratuita</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section Placeholder */}
      <div className="mt-16 pt-16 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Productos relacionados</h3>
        <div className="text-gray-600">
          Próximamente mostraremos productos relacionados aquí
        </div>
      </div>
    </div>
  )
}