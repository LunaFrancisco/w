import { Suspense } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProductsContent } from '@/components/ecommerce/ProductsContent'

export default async function ProductsPage() {
  const session = await auth()
  
  if (!session || session.user.role === 'PENDING') {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600 mt-2">Descubre productos exclusivos para miembros</p>
          </div>
          {session.user.role === 'ADMIN' && (
            <div className="flex space-x-3">
              <Link 
                href="/admin/productos"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Gestionar Productos
              </Link>
              <Link 
                href="/admin/productos/nuevo"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Crear Producto
              </Link>
            </div>
          )}
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  )
}