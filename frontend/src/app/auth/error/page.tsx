import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Error de Autenticación - Club W',
  description: 'Ha ocurrido un error durante el proceso de autenticación.',
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Error de Autenticación
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Ha ocurrido un error durante el proceso de inicio de sesión. 
              Por favor, inténtalo de nuevo o contacta al soporte si el problema persiste.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Posibles Causas</h3>
              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <p>• Error temporal del servidor de autenticación</p>
                <p>• Problemas de conexión a internet</p>
                <p>• Configuración de cookies o JavaScript deshabilitada</p>
                <p>• Tu cuenta puede estar pendiente de aprobación</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gradient-green text-white border-0">
                  <Link href="/auth/signin">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Intentar de nuevo
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Link>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  ¿Necesitas ayuda?{' '}
                  <Link href="/contacto" className="text-primary hover:underline">
                    Contacta al soporte
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}