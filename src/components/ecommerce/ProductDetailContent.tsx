'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, Share2, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Zap, Package, Check, X, ShoppingBag, Eye, Users, Clock, Award, Gift } from 'lucide-react'
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
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [addedToCart, setAddedToCart] = useState(false)
  const [viewCount, setViewCount] = useState(47)
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
      await addToCart(product.id, quantity)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
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

            {/* Live viewers indicator */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl px-5 py-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white animate-pulse"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full border-2 border-white animate-pulse animation-delay-1000"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full border-2 border-white animate-pulse animation-delay-2000"></div>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">{viewCount} personas viendo este producto</span>
              </div>
            </div>
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

            {/* Rating with animation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-6 w-6 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} transition-all duration-300 hover:scale-125`}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">4.8</span>
                <span>•</span>
                <span className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer transition-colors">
                  <Users className="h-4 w-4" />
                  <span>127 reseñas verificadas</span>
                </span>
              </div>
            </div>

            {/* Price Section with discount */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 space-y-3">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl lg:text-5xl font-black text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.price * 1.2)}
                </span>
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-bounce">
                  -20%
                </span>
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

            {/* Stock Status with progress bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-semibold">En stock</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-700 font-semibold">Agotado</span>
                    </>
                  )}
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-gray-600">
                    {product.stock} disponibles
                  </span>
                )}
              </div>
              {product.stock > 0 && product.stock < 50 && (
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(product.stock / 50) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Description with glassmorphism */}
            <div className="backdrop-blur-sm bg-white/50 rounded-2xl p-6 border border-gray-100">
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector with modern design */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Cantidad</span>
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
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-white transition-all duration-300 text-xl font-semibold hover:shadow-md"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Total: {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons with animations */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isLoading}
                className={`relative w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl overflow-hidden group ${
                  product.stock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl'
                } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {/* Animated background */}
                {product.stock > 0 && !isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
                
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                      Agregando al carrito...
                    </>
                  ) : product.stock === 0 ? (
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

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-1 py-4 px-6 rounded-2xl border-2 font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isFavorite
                      ? 'border-red-500 text-red-600 bg-red-50 shadow-lg'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-md bg-white'
                  }`}
                >
                  <Heart 
                    className={`h-5 w-5 mr-2 inline transition-all duration-300 ${
                      isFavorite ? 'fill-current animate-heartbeat' : ''
                    }`} 
                  />
                  {isFavorite ? 'En favoritos' : 'Favoritos'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 transition-all duration-300 transform hover:scale-105 bg-white hover:shadow-md"
                >
                  <Share2 className="h-5 w-5 mr-2 inline" />
                  Compartir
                </button>
              </div>
            </div>

            {/* Trust Badges with hover effects */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
              {[
                { icon: Truck, color: 'blue', title: 'Envío gratuito', subtitle: 'En pedidos +$50.000' },
                { icon: Shield, color: 'green', title: 'Compra segura', subtitle: 'Protección garantizada' },
                { icon: RotateCcw, color: 'purple', title: '30 días', subtitle: 'Devolución gratuita' }
              ].map((badge, index) => (
                <div 
                  key={index}
                  className="group text-center space-y-2 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                >
                  <badge.icon 
                    className={`h-10 w-10 text-${badge.color}-600 mx-auto group-hover:scale-110 transition-transform duration-300`} 
                  />
                  <div className="text-sm font-semibold text-gray-900">{badge.title}</div>
                  <div className="text-xs text-gray-600">{badge.subtitle}</div>
                </div>
              ))}
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