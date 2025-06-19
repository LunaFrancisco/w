import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditProductForm } from '@/components/admin/EditProductForm'

interface EditProductPageProps {
  params: {
    slug: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }

  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600 mt-2">
          Modifica la información del producto
        </p>
      </div>

      <EditProductForm 
        product={{
          ...product,
          price: Number(product.price),
          images: Array.isArray(product.images) 
            ? product.images.filter((img): img is string => typeof img === 'string')
            : [],
        }} 
        categories={categories} 
      />
    </div>
  )
}