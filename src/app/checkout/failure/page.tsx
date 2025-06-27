import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CheckoutFailurePage({
  searchParams,
}: {
  searchParams: { order_id?: string; payment_id?: string; status?: string; collection_id?: string }
}) {
  const session = await auth()
  
  if (!session || session.user.role === 'PENDING') {
    redirect('/auth/signin')
  }

  const orderId = searchParams.order_id
  const paymentId = searchParams.payment_id
  const collectionId = searchParams.collection_id

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Pago Rechazado
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            No se pudo procesar tu pago. No te preocupes, puedes intentar nuevamente.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          {orderId && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Número de Pedido:</span>
              <span className="text-sm font-mono text-gray-900">#{orderId.slice(-8).toUpperCase()}</span>
            </div>
          )}
          
          {(paymentId || collectionId) && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">ID de Pago:</span>
              <span className="text-sm font-mono text-gray-900">{paymentId || collectionId}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-gray-600">Estado:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Rechazado
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="flex-shrink-0 h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Posibles causas
              </h3>
              <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                <li>Fondos insuficientes</li>
                <li>Datos de tarjeta incorrectos</li>
                <li>Problemas con el banco emisor</li>
                <li>Límite de compra excedido</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full gradient-green text-white">
            <Link href="/checkout">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar nuevamente
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/carrito">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al carrito
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="w-full">
            <Link href="/productos">
              Continuar comprando
            </Link>
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            ¿Necesitas ayuda? {' '}
            <Link href="/contacto" className="text-blue-600 hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}