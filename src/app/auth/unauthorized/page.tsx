import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Acceso No Autorizado - Club W',
  description: 'No tienes permisos para acceder a esta sección de Club W.',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-2xl w-full">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Acceso No Autorizado
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              No tienes los permisos necesarios para acceder a esta sección de Club W. 
              Esta área está reservada para miembros con roles específicos.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">¿Qué puedo hacer?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Verifica tu membresía</p>
                    <p className="text-xs text-muted-foreground">
                      Asegúrate de que tu cuenta tenga el rol adecuado para acceder.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contacta al administrador</p>
                    <p className="text-xs text-muted-foreground">
                      Si crees que deberías tener acceso, contáctanos para revisar tu cuenta.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Solicita membresía</p>
                    <p className="text-xs text-muted-foreground">
                      Si aún no eres miembro, puedes solicitar acceso a Club W.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="gradient-green text-white border-0">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href="/contacto">
                    <Mail className="w-4 h-4 mr-2" />
                    Contactar Soporte
                  </Link>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  ¿No eres miembro?{' '}
                  <Link href="/solicitud-acceso" className="text-primary hover:underline">
                    Solicita tu membresía aquí
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