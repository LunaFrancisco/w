import { Metadata } from 'next'
import { Suspense } from 'react'
import SignInForm from '@/components/auth/SignInForm'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Club W',
  description: 'Inicia sesión en tu cuenta de Club W para acceder a productos exclusivos y ofertas especiales.',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<div>Cargando...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}