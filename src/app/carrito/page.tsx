import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CartContent } from '@/components/ecommerce/CartContent'

export default async function CartPage() {
  const session = await auth()
  
  if (!session || session.user.role === 'PENDING') {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
          <p className="text-gray-600 mt-2">Revisa tus productos antes de proceder al pago</p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <CartContent />
        </Suspense>
      </div>
    </div>
  )
}