import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SuccessHandler } from '@/components/checkout/SuccessHandler'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; payment_id?: string; status?: string; collection_id?: string }>
}) {
  const session = await auth()
  
  if (!session || session.user.role === 'PENDING') {
    redirect('/auth/signin')
  }

  const params = await searchParams
  const orderId = params.order_id
  const paymentId = params.payment_id
  const collectionId = params.collection_id
  const status = params.status

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SuccessHandler status={status} orderId={orderId} />
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¡Pago Exitoso!
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            Tu pedido ha sido procesado correctamente
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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {status === 'approved' ? 'Aprobado' : 'Procesado'}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Package className="flex-shrink-0 h-5 w-5 text-blue-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ¿Qué sigue?
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Recibirás un email de confirmación con los detalles de tu pedido. 
                Te notificaremos cuando tu pedido esté en camino.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full gradient-green text-white">
            <Link href="/pedidos">
              Ver mis pedidos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
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