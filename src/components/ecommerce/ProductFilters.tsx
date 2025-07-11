'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
  currentCategory: string
  currentSort: string
  minPrice: string
  maxPrice: string
  onFilterChange?: () => void
}

export function ProductFilters({ 
  categories, 
  currentCategory, 
  currentSort,
  minPrice,
  maxPrice,
  onFilterChange 
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState({
    min: minPrice,
    max: maxPrice
  })

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to first page when filtering
    params.delete('page')
    
    router.push(`/productos?${params.toString()}`)
    onFilterChange?.()
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (priceRange.min) {
      params.set('minPrice', priceRange.min)
    } else {
      params.delete('minPrice')
    }
    
    if (priceRange.max) {
      params.set('maxPrice', priceRange.max)
    } else {
      params.delete('maxPrice')
    }
    
    // Reset to first page when filtering
    params.delete('page')
    
    router.push(`/productos?${params.toString()}`)
    onFilterChange?.()
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    const search = searchParams.get('search')
    if (search) {
      params.set('search', search)
    }
    
    router.push(`/productos?${params.toString()}`)
    setPriceRange({ min: '', max: '' })
    onFilterChange?.()
  }

  const hasActiveFilters = currentCategory || currentSort !== 'name' || minPrice || maxPrice

  return (
    <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:p-6">
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      {/* Mobile clear filters button */}
      <div className="lg:hidden mb-6">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>

      {/* Sort by */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Ordenar por
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="name">Nombre A-Z</option>
          <option value="name_desc">Nombre Z-A</option>
          <option value="price_asc">Precio: Menor a Mayor</option>
          <option value="price_desc">Precio: Mayor a Menor</option>
          <option value="created_desc">Más Recientes</option>
          <option value="featured">Destacados</option>
        </select>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Categoría
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={!currentCategory}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Todas las categorías</span>
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category.slug}
                checked={currentCategory === category.slug}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Rango de Precio
        </label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Precio mínimo</label>
            <input
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Precio máximo</label>
            <input
              type="number"
              placeholder="Sin límite"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Aplicar filtro de precio
          </button>
        </div>
      </div>

      {/* Quick Price Filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Filtros rápidos
        </label>
        <div className="space-y-2">
          {[
            { label: 'Menos de $100.000', max: '100000' },
            { label: '$100.000 - $500.000', min: '100000', max: '500000' },
            { label: '$500.000 - $1.000.000', min: '500000', max: '1000000' },
            { label: 'Más de $1.000.000', min: '1000000' },
          ].map((filter) => (
            <button
              key={filter.label}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                if (filter.min) params.set('minPrice', filter.min)
                else params.delete('minPrice')
                if (filter.max) params.set('maxPrice', filter.max)
                else params.delete('maxPrice')
                params.delete('page')
                router.push(`/productos?${params.toString()}`)
                setPriceRange({ min: filter.min || '', max: filter.max || '' })
                onFilterChange?.()
              }}
              className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}