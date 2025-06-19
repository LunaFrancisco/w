import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductsManagement } from '@/components/admin/ProductsManagement'

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

  // Convert products to the expected format
  const formattedProducts = products.map(product => ({
    ...product,
    price: Number(product.price),
    images: Array.isArray(product.images) 
      ? product.images.filter((img): img is string => typeof img === 'string')
      : [],
  }))

  return (
    <ProductsManagement 
      products={formattedProducts}
      categories={categories}
      productStats={productStats}
    />
  )
}