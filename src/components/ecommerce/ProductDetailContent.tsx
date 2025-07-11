'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Zap, Package, Check, X, ShoppingBag, Clock, Award, Gift, Package2, Calculator } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

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
  images: string[]
  featured: boolean
  allowIndividualSale: boolean
  category: {
    id: string
    name: string
    slug: string
  }
  variants?: ProductVariant[]
}

interface ProductDetailContentProps {
  product: Product
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [addedToCart, setAddedToCart] = useState(false)
  const [viewCount, setViewCount] = useState(47)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (!product.allowIndividualSale && product.variants && product.variants.length > 0) {
      // Si no se permite venta individual, seleccionar la primera variante automáticamente
      return product.variants.find(v => v.isDefault) || product.variants[0]
    }
    return product.variants?.find(v => v.isDefault) || null
  })
  const { addToCart } = useCart()

  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 3))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

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
      await addToCart(product.slug, quantity, selectedVariant?.id)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentPrice = () => {
    return selectedVariant ? selectedVariant.price : product.price
  }

  const getAvailableStock = () => {
    if (!selectedVariant) return product.stock
    return Math.floor(product.stock / selectedVariant.units)
  }

  const getSavingsInfo = () => {
    if (!selectedVariant) return null
    const individualTotal = product.price * selectedVariant.units
    const savings = individualTotal - selectedVariant.price
    const percentage = individualTotal > 0 ? (savings / individualTotal) * 100 : 0
    return { savings, percentage }
  }


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg']

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb with glass effect */}
        <nav className="flex items-center space-x-2 text-sm mb-8 backdrop-blur-sm bg-white/30 rounded-full px-4 py-2 w-fit">
          <Link href="/productos" className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 group">
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Productos
          </Link>
          <span className="text-gray-400">/</span>
          <Link href={`/productos?category=${product.category.slug}`} className="text-gray-700 hover:text-blue-600 transition-colors">
            {product.category.name}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images Section */}
          <div className="space-y-6">
            {/* Main Image with hover zoom */}
            <div 
              className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-2xl group cursor-zoom-in"
              onMouseEnter={() => setShowImageZoom(true)}
              onMouseLeave={() => setShowImageZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBYXZMBQeT6RkS8bXDqKlqHKlBb0HE6fmBE5xeKvqlCXNpKxhjjc3ksrVmPCp0nzQthPOISuCMQqjhJy2/Wl3kn6+yqXawSa1gSXzRBWgB/G/Dxn9Kq8nH3JJHsRp3PG2Cty3UtqhNDbE6fYE/Dp+iqjI19fFp0LJKh5H1Q1f//9k="
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Zoom overlay */}
              {showImageZoom && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    backgroundImage: `url(${images[selectedImageIndex]})`,
                    backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                    backgroundSize: '250%',
                    opacity: 0,
                    animation: 'fadeIn 0.3s forwards'
                  }}
                />
              )}

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-6 left-6 space-y-3">
                {product.featured && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 backdrop-blur-sm animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    <span>Destacado</span>
                  </div>
                )}
                {product.stock > 0 && product.stock < 10 && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 backdrop-blur-sm">
                    <Zap className="h-4 w-4" />
                    <span>¡Últimas {product.stock} unidades!</span>
                  </div>
                )}
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-red-600 text-white text-xl font-bold px-8 py-4 rounded-2xl shadow-2xl transform rotate-12">
                    AGOTADO
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'ring-4 ring-blue-500 ring-offset-2 scale-105 shadow-lg'
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Category with animated underline */}
            <Link 
              href={`/productos?category=${product.category.slug}`}
              className="inline-flex items-center space-x-2 text-blue-600 font-semibold text-sm uppercase tracking-wider group"
            >
              <Package className="h-4 w-4" />
              <span className="relative">
                {product.category.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>

            {/* Product Name with gradient */}
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
              {product.name}
            </h1>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {getAvailableStock() > 0 ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-bold text-xl">Disponible</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-bold text-xl">Agotado</span>
                </>
              )}
            </div>

            {/* Format Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Package2 className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Selecciona el formato de compra</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Individual option - Solo mostrar si se permite venta individual */}
                  {product.allowIndividualSale && (
                    <button
                      onClick={() => setSelectedVariant(null)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                        !selectedVariant
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Unidad Individual</div>
                          <div className="text-sm text-gray-600">1 unidad</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</div>
                          <div className="text-sm text-gray-600">Stock: {product.stock}</div>
                        </div>
                      </div>
                    </button>
                  )}
                  
                  {/* Variant options */}
                  {product.variants.filter(v => v.active).map((variant) => {
                    const savings = getSavingsInfo()
                    const isSelected = selectedVariant?.id === variant.id
                    const availableStock = Math.floor(product.stock / variant.units)
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{variant.name}</div>
                            <div className="text-sm text-gray-600">{variant.units} unidades</div>
                            {isSelected && savings && savings.savings > 0 && (
                              <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                                <Calculator className="h-3 w-3" />
                                <span>Ahorras {formatPrice(savings.savings)} ({savings.percentage.toFixed(1)}%)</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">{formatPrice(variant.price)}</div>
                            <div className="text-sm text-gray-600">Stock: {availableStock} packs</div>
                            {variant.isDefault && (
                              <div className="text-xs text-purple-600 font-medium">Recomendado</div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Price Section with discount */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 space-y-3">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl lg:text-5xl font-black text-gray-900">
                  {formatPrice(getCurrentPrice())}
                </span>
                {selectedVariant && (
                  <div className="text-sm text-gray-600">
                    por {selectedVariant.units} unidades
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Award className="h-4 w-4 text-purple-600" />
                <span>Precio exclusivo para miembros</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                <Gift className="h-4 w-4" />
                <span>Envío gratis en esta compra</span>
              </div>
            </div>

            {/* Description with glassmorphism */}
            <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 border border-gray-100">
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector with modern design */}
            {getAvailableStock() > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Cantidad{selectedVariant ? ` (${selectedVariant.units} unidades por pack)` : ''}</span>
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white transition-all duration-300 text-xl font-semibold hover:shadow-md"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                      className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white transition-all duration-300 text-xl font-semibold hover:shadow-md"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div>Total: {formatPrice(getCurrentPrice() * quantity)}</div>
                    {selectedVariant && (
                      <div className="text-xs">
                        {quantity * selectedVariant.units} unidades en total
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons with animations */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={getAvailableStock() === 0 || isLoading}
                className={`relative w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl overflow-hidden group ${
                  getAvailableStock() === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-400'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl transform hover:scale-105 active:scale-95'
                } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {/* Animated background */}
                {getAvailableStock() > 0 && !isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
                
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                      Agregando al carrito...
                    </>
                  ) : getAvailableStock() === 0 ? (
                    <>
                      <X className="h-5 w-5 mr-2" />
                      Producto Agotado
                    </>
                  ) : addedToCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2 animate-bounce" />
                      ¡Agregado exitosamente!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                      Agregar al carrito
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={handleAddToCart}
                disabled={getAvailableStock() === 0 || isLoading}
                className={`w-full py-4 px-6 rounded-2xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  getAvailableStock() === 0
                    ? 'border-gray-400 bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:shadow-md'
                }`}
              >
                <ShoppingBag className="h-5 w-5 mr-2 inline" />
                {getAvailableStock() === 0 ? 'Producto Agotado' : 'Comprar Ahora'}
              </button>
            </div>


            {/* Limited time offer */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 flex items-center space-x-3 border border-yellow-200">
              <Clock className="h-6 w-6 text-orange-600 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Oferta por tiempo limitado</p>
                <p className="text-xs text-gray-600">Esta promoción termina en 24 horas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section with modern design */}
        <div className="mt-24 pt-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Productos relacionados
            </h3>
            <Link 
              href={`/productos?category=${product.category.slug}`}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2 group"
            >
              <span>Ver todos</span>
              <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 flex items-center justify-center min-h-[200px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto animate-pulse"></div>
              <p className="text-gray-600 font-medium">Cargando productos relacionados...</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-heartbeat {
          animation: heartbeat 0.8s ease-in-out infinite;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}