'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { sendGTMEvent } from '@next/third-parties/google'

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams?.get('error')

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    sendGTMEvent({ event: 'click_google_login', label: 'Clic en Iniciar Sesión con Google' })

    try {
      const result = await signIn('google', {
        callbackUrl,
        redirect: true,
      })
      
      if (result?.error) {
        setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.')
      }
    } catch (err) {
      setError('Error al conectar con Google. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            Bienvenido a <span className="text-gradient">Club W</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Inicia sesión para acceder a tu cuenta y productos exclusivos
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">        {/* Display error messages */}
        {(error || errorParam) && (
          <div className={`p-4 border rounded-md flex items-end space-x-2 ${
            errorParam === 'AccessDenied' 
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800' 
              : 'bg-destructive/10 border-destructive/20'
          }`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              errorParam === 'AccessDenied' 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-destructive'
            }`} />
            <div className={`text-sm ${
              errorParam === 'AccessDenied' 
                ? 'text-amber-800 dark:text-amber-200' 
                : 'text-destructive'
            }`}>
              {error || getErrorMessage(errorParam)}
            </div>
          </div>
        )}

        {/* Google Sign In Button */}
        <Button
          id='google-signin-button'
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-6 text-lg font-medium"
          variant="outline"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-3" />
              Conectando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </Button>

        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                ¿Aún no eres miembro?
              </span>
            </div>
          </div>

          <Button variant="outline" asChild className="w-full">
            <Link href="/solicitud-acceso">
              Solicitar Membresía
            </Link>
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <Button variant="ghost" asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            Al continuar, aceptas nuestros{' '}
            <Link href="/terminos-condiciones" className="text-primary hover:underline">
              Términos y Condiciones
            </Link>{' '}
            y{' '}
            <Link href="/politica-privacidad" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: string | null): string {
  switch (error) {
    case 'Configuration':
      return 'Error de configuración del servidor. Contacta al administrador.'
    case 'AccessDenied':
      return 'Cuenta no registrada. Solicita membresía.'
    case 'Verification':
      return 'Error de verificación. El enlace puede haber expirado.'
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
      return 'Error al conectar con Google. Por favor, inténtalo de nuevo.'
    case 'OAuthAccountNotLinked':
      return 'Esta cuenta ya existe con un proveedor diferente.'
    case 'EmailSignin':
      return 'Error al enviar el enlace de verificación.'
    case 'CredentialsSignin':
      return 'Credenciales incorrectas.'
    case 'SessionRequired':
      return 'Debes iniciar sesión para acceder a esta página.'
    default:
      return 'Error desconocido. Por favor, inténtalo de nuevo.'
  }
}