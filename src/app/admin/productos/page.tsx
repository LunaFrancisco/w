import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ProductsManagementPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }

  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } }
    },
    orderBy: { name: 'asc' }
  })

  const productStats = {
    total: products.length,
    active: products.filter(p => p.active).length,
    inactive: products.filter(p => !p.active).length,
    lowStock: products.filter(p => p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">
            Administra el catálogo de productos del club
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            Agregar Producto
          </Link>
        </Button>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={productStats.total} color="gray" />
        <StatCard title="Activos" value={productStats.active} color="green" />
        <StatCard title="Inactivos" value={productStats.inactive} color="red" />
        <StatCard title="Stock Bajo" value={productStats.lowStock} color="orange" />
        <StatCard title="Sin Stock" value={productStats.outOfStock} color="red" />
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category._count.products} productos
                </p>
                <Badge 
                  variant="secondary"
                  className={category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {category.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay productos en el sistema
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, color }: {
  title: string
  value: number
  color: string
}) {
  const colorClasses = {
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-lg font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductCard({ product }: { product: any }) {
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Sin stock</Badge>
    }
    if (stock < 10) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Stock bajo</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">En stock</Badge>
  }

  const getStatusBadge = (active: boolean) => {
    return (
      <Badge variant="secondary" className={active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {active ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {product.images && product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              {getStatusBadge(product.active)}
              {getStockBadge(product.stock)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Categoría: {product.category?.name || 'Sin categoría'}
            </p>
            <p className="text-xs text-gray-500">
              ID: {product.id.slice(-8)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">${Number(product.price).toLocaleString()}</p>
          <p className="text-sm text-gray-600">Stock: {product.stock}</p>
          <Badge variant="secondary" className={product.featured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
            {product.featured ? 'Destacado' : 'Normal'}
          </Badge>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-xs text-gray-500">
          Creado: {new Date(product.createdAt).toLocaleDateString('es-ES')}
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/productos/${product.slug}`}>
              Editar
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/productos/${product.slug}`} target="_blank">
              Ver
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}