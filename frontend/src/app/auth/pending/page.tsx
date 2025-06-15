import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Mail, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Membresía Pendiente - Club W',
  description: 'Tu solicitud de membresía está siendo revisada. Te contactaremos pronto.',
}

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Membresía en Revisión
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Tu solicitud de membresía a Club W está siendo revisada por nuestro equipo. 
              Te contactaremos por email dentro de los próximos 3-5 días hábiles.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Estado de tu Solicitud
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-sm">Solicitud enviada exitosamente</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">
                    ⏳
                  </div>
                  <span className="text-sm">En revisión por el equipo de Club W</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-xs font-bold">
                    ○
                  </div>
                  <span className="text-sm text-muted-foreground">Respuesta por email</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-blue-900">¿Qué sigue?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Recibirás un email con la decisión sobre tu membresía. Si eres aprobado, 
                    te enviaremos las instrucciones para activar tu cuenta y comenzar a comprar.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button asChild className="gradient-green text-white border-0">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Link>
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  ¿Tienes preguntas?{' '}
                  <Link href="/contacto" className="text-primary hover:underline">
                    Contáctanos aquí
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