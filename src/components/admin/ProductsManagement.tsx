'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Search, 
  Grid3x3, 
  List, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Filter,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package2,
  Calculator
} from 'lucide-react'
import { CreateCategoryForm } from './CreateCategoryForm'

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
  categoryId: string
  active: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
  category: {
    name: string
  }
  variants?: ProductVariant[]
  _count?: {
    variants: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  active: boolean
  showInHome: boolean
  _count: {
    products: number
  }
}

interface ProductStats {
  total: number
  active: number
  inactive: number
  lowStock: number
  outOfStock: number
}

interface ProductsManagementProps {
  products: Product[]
  categories: Category[]
  productStats: ProductStats
}

export function ProductsManagement({ products, categories, productStats }: ProductsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('active') // Default to active only
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && product.active) ||
                         (selectedStatus === 'inactive' && !product.active)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', variant: 'destructive' as const, icon: XCircle }
    if (stock < 10) return { label: 'Stock bajo', variant: 'secondary' as const, icon: AlertTriangle }
    return { label: 'En stock', variant: 'secondary' as const, icon: CheckCircle }
  }

  const getProductStatus = (active: boolean) => {
    return active 
      ? { label: 'Activo', variant: 'secondary' as const, className: 'bg-green-100 text-green-800' }
      : { label: 'Inactivo', variant: 'secondary' as const, className: 'bg-red-100 text-red-800' }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsCategoryFormOpen(true)
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setIsCategoryFormOpen(true)
  }

  const handleCategorySuccess = () => {
    // Refresh the page to show updated categories
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">
            Administra el catálogo completo de productos del club
          </p>
        </div>
        <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Link href="/admin/productos/nuevo">
            <Plus className="h-5 w-5 mr-2" />
            Crear Producto
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          title="Total Productos" 
          value={productStats.total} 
          icon={Package}
          trend="+12% vs mes anterior"
          color="blue" 
        />
        <StatCard 
          title="Productos Activos" 
          value={productStats.active} 
          icon={CheckCircle}
          trend="+5% vs mes anterior"
          color="green" 
        />
        <StatCard 
          title="Productos Inactivos" 
          value={productStats.inactive} 
          icon={XCircle}
          trend="-2% vs mes anterior"
          color="red" 
        />
        <StatCard 
          title="Stock Bajo" 
          value={productStats.lowStock} 
          icon={AlertTriangle}
          trend="3 productos críticos"
          color="orange" 
        />
        <StatCard 
          title="Sin Stock" 
          value={productStats.outOfStock} 
          icon={XCircle}
          trend="Requiere atención"
          color="red" 
        />
      </div>

      {/* Categories Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Categorías
              </CardTitle>
              <CardDescription>
                Distribución de productos por categoría
              </CardDescription>
            </div>
            <Button
              onClick={handleCreateCategory}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              + Crear Categoría
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                onClick={() => handleEditCategory(category)}
                className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category._count.products} productos
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge 
                    variant="secondary"
                    className={`${category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {category.active ? 'Activa' : 'Inactiva'}
                  </Badge>
                  {category.showInHome && (
                    <Badge variant="outline" className="text-xs">
                      En Home
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Form */}
      <CreateCategoryForm
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSuccess={handleCategorySuccess}
        category={editingCategory}
      />

      {/* Filters and View Controls */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row gap-4 md:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="active">Solo activos</option>
                    <option value="inactive">Solo inactivos</option>
                    <option value="all">Todos los estados</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Tabla
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle>
            Productos ({filteredProducts.length})
          </CardTitle>
          <CardDescription>
            {searchTerm && `Resultados para "${searchTerm}"`}
            {selectedCategory !== 'all' && ` en ${categories.find(c => c.id === selectedCategory)?.name}`}
            {selectedStatus !== 'all' && ` - ${selectedStatus === 'active' ? 'Solo activos' : 'Solo inactivos'}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
              <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          ) : viewMode === 'grid' ? (
            <ProductGrid products={filteredProducts} formatPrice={formatPrice} />
          ) : (
            <ProductTable products={filteredProducts} formatPrice={formatPrice} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, color }: {
  title: string
  value: number
  icon: any
  trend: string
  color: string
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50',
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductGrid({ products, formatPrice }: { products: Product[], formatPrice: (price: number) => string }) {
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteProduct = async (product: Product) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${product.slug}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the page to show updated products
        window.location.reload()
      } else {
        alert(data.error || 'Error al eliminar el producto')
      }
    } catch (error) {
      alert('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
      setDeletingProduct(null)
    }
  }

  const handleDeactivateProduct = async (product: Product) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${product.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: false }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the page to show updated products
        window.location.reload()
      } else {
        alert(data.error || 'Error al desactivar el producto')
      }
    } catch (error) {
      alert('Error al desactivar el producto')
    } finally {
      setIsDeleting(false)
      setDeletingProduct(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductGridCard 
            key={product.id} 
            product={product} 
            formatPrice={formatPrice}
            onDelete={() => setDeletingProduct(product)} 
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Qué deseas hacer con este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Puedes eliminar permanentemente el producto "{deletingProduct?.name}" o desactivarlo para mantener el historial.
              {deletingProduct && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    <strong>Recomendación:</strong> Si el producto tiene pedidos asociados, solo podrás desactivarlo. 
                    La desactivación es más segura y mantiene el historial.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button
              onClick={() => deletingProduct && handleDeactivateProduct(deletingProduct)}
              disabled={isDeleting}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {isDeleting ? 'Procesando...' : 'Desactivar'}
            </Button>
            <AlertDialogAction
              onClick={() => deletingProduct && handleDeleteProduct(deletingProduct)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ProductGridCard({ product, formatPrice, onDelete }: { product: Product, formatPrice: (price: number) => string, onDelete: () => void }) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', variant: 'destructive' as const, icon: XCircle }
    if (stock < 10) return { label: 'Stock bajo', variant: 'secondary' as const, icon: AlertTriangle }
    return { label: 'En stock', variant: 'secondary' as const, icon: CheckCircle }
  }

  const getProductStatus = (active: boolean) => {
    return active 
      ? { label: 'Activo', variant: 'secondary' as const, className: 'bg-green-100 text-green-800' }
      : { label: 'Inactivo', variant: 'secondary' as const, className: 'bg-red-100 text-red-800' }
  }

  const stockStatus = getStockStatus(product.stock)
  const productStatus = getProductStatus(product.active)

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              ⭐ Destacado
            </Badge>
          )}
          <Badge variant={productStatus.variant} className={productStatus.className}>
            {productStatus.label}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge variant={stockStatus.variant} className={stockStatus.variant === 'destructive' ? 'bg-red-100 text-red-800' : stockStatus.variant === 'secondary' && product.stock < 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
            <stockStatus.icon className="h-3 w-3 mr-1" />
            {stockStatus.label}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-blue-600 font-medium">{product.category.name}</p>
              {product.variants && product.variants.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  <Package2 className="h-3 w-3" />
                  {product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              {product.variants && product.variants.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Precio desde:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(Math.min(Number(product.price), ...product.variants.map(v => Number(v.price))))}
                  </p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(Number(product.price))}
                  </p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/admin/productos/${product.slug}`}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/productos/${product.slug}`} target="_blank">
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductTable({ products, formatPrice }: { products: Product[], formatPrice: (price: number) => string }) {
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteProduct = async (product: Product) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${product.slug}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the page to show updated products
        window.location.reload()
      } else {
        alert(data.error || 'Error al eliminar el producto')
      }
    } catch (error) {
      alert('Error al eliminar el producto')
    } finally {
      setIsDeleting(false)
      setDeletingProduct(null)
    }
  }

  const handleDeactivateProduct = async (product: Product) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${product.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: false }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the page to show updated products
        window.location.reload()
      } else {
        alert(data.error || 'Error al desactivar el producto')
      }
    } catch (error) {
      alert('Error al desactivar el producto')
    } finally {
      setIsDeleting(false)
      setDeletingProduct(null)
    }
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16"></TableHead>
              <TableHead className="font-semibold">Producto</TableHead>
              <TableHead className="font-semibold">Categoría</TableHead>
              <TableHead className="font-semibold">Precio</TableHead>
              <TableHead className="font-semibold">Stock</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductTableRow 
                key={product.id} 
                product={product} 
                formatPrice={formatPrice}
                onDelete={() => setDeletingProduct(product)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Qué deseas hacer con este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Puedes eliminar permanentemente el producto "{deletingProduct?.name}" o desactivarlo para mantener el historial.
              {deletingProduct && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    <strong>Recomendación:</strong> Si el producto tiene pedidos asociados, solo podrás desactivarlo. 
                    La desactivación es más segura y mantiene el historial.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button
              onClick={() => deletingProduct && handleDeactivateProduct(deletingProduct)}
              disabled={isDeleting}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {isDeleting ? 'Procesando...' : 'Desactivar'}
            </Button>
            <AlertDialogAction
              onClick={() => deletingProduct && handleDeleteProduct(deletingProduct)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ProductTableRow({ product, formatPrice, onDelete }: { product: Product, formatPrice: (price: number) => string, onDelete: () => void }) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', variant: 'destructive' as const, icon: XCircle }
    if (stock < 10) return { label: 'Stock bajo', variant: 'secondary' as const, icon: AlertTriangle }
    return { label: 'En stock', variant: 'secondary' as const, icon: CheckCircle }
  }

  const getProductStatus = (active: boolean) => {
    return active 
      ? { label: 'Activo', variant: 'secondary' as const, className: 'bg-green-100 text-green-800' }
      : { label: 'Inactivo', variant: 'secondary' as const, className: 'bg-red-100 text-red-800' }
  }

  const stockStatus = getStockStatus(product.stock)
  const productStatus = getProductStatus(product.active)

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
          <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
          <div className="flex items-center gap-2 mt-2">
            {product.featured && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                ⭐ Destacado
              </Badge>
            )}
            {product.variants && product.variants.length > 0 && (
              <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs">
                <Package2 className="h-3 w-3 mr-1" />
                {product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          {product.category.name}
        </Badge>
      </TableCell>
      <TableCell>
        {product.variants && product.variants.length > 0 ? (
          <div>
            <div className="font-semibold text-gray-900">
              {formatPrice(Math.min(Number(product.price), ...product.variants.map(v => Number(v.price))))}
            </div>
            <div className="text-xs text-gray-500">desde</div>
          </div>
        ) : (
          <div className="font-semibold text-gray-900">
            {formatPrice(Number(product.price))}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{product.stock}</div>
          <Badge 
            variant={stockStatus.variant} 
            className={`text-xs ${stockStatus.variant === 'destructive' ? 'bg-red-100 text-red-800' : stockStatus.variant === 'secondary' && product.stock < 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}
          >
            <stockStatus.icon className="h-3 w-3 mr-1" />
            {stockStatus.label}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={productStatus.variant} className={productStatus.className}>
          {productStatus.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600">
          {new Date(product.createdAt).toLocaleDateString('es-ES')}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/productos/${product.slug}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/productos/${product.slug}`} target="_blank">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}