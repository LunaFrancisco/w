'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from './ProductCard'
import { ProductFilters } from './ProductFilters'
import { ProductSearch } from './ProductSearch'
import { Pagination } from './Pagination'
import { ProductCardSkeleton } from '../ui/product-skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Filter } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  slug: string
}

export function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort') || 'name'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  useEffect(() => {
    fetchProducts()
  }, [search, category, sortBy, minPrice, maxPrice, currentPage])

  useEffect(() => {
    fetchCategories()
  }, []) // Solo cargar categorías una vez

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(search && { search }),
        ...(category && { category }),
        ...(sortBy && { sort: sortBy }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      })

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Error al cargar productos')
      
      const data = await response.json()
      setProducts(data.products)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?hideEmpty=true')
      if (!response.ok) throw new Error('Error al cargar categorías')
      
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar productos</h3>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop Sidebar with filters */}
      <div className="hidden lg:block lg:w-1/4">
        <ProductFilters 
          categories={categories}
          currentCategory={category}
          currentSort={sortBy}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      </div>

      {/* Main content */}
      <div className="lg:w-3/4">
        {/* Search bar and mobile filter button */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <ProductSearch initialValue={search} />
            </div>
            
            {/* Mobile filter button */}
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filtros
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters 
                    categories={categories}
                    currentCategory={category}
                    currentSort={sortBy}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onFilterChange={() => setIsFilterSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Cargando...' : `${products.length} productos encontrados`}
          </p>
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}