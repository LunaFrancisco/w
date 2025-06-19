import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CreateProductForm } from '@/components/admin/CreateProductForm'

export default async function CreateProductPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/unauthorized')
  }

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Producto</h1>
        <p className="text-gray-600 mt-2">
          Agrega un nuevo producto al catálogo del club
        </p>
      </div>

      <CreateProductForm categories={categories} />
    </div>
  )
}