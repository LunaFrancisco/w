import { Metadata } from 'next'
import AccessRequestForm from '@/components/forms/AccessRequestForm'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Users, Star, CheckCircle, Clock, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Solicitud de Membresía - Club W',
  description: 'Solicita tu membresía exclusiva en Club W y accede a productos premium con precios especiales solo para miembros verificados.',
}

export default function AccessRequestPage() {
  return (
    <div className="min-h-screen bg-background py-12 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Únete a <span className="text-gradient">Club W</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Solicita tu membresía exclusiva y accede a productos premium con precios 
            especiales solo para miembros verificados.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Access Request Form */}
          <div className="lg:col-span-2 animate-slide-up">
            <AccessRequestForm />
          </div>

          {/* Benefits and Information */}
          <div className="space-y-6 animate-slide-up">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-primary" />
                  Beneficios de la Membresía
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Acceso Exclusivo</h4>
                      <p className="text-sm text-muted-foreground">
                        Catálogo premium solo para miembros verificados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Precios Especiales</h4>
                      <p className="text-sm text-muted-foreground">
                        Descuentos y ofertas exclusivas en todos los productos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Atención Prioritaria</h4>
                      <p className="text-sm text-muted-foreground">
                        Soporte personalizado y atención preferencial
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Envío Premium</h4>
                      <p className="text-sm text-muted-foreground">
                        Envío rápido y seguro con seguimiento detallado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Productos Únicos</h4>
                      <p className="text-sm text-muted-foreground">
                        Acceso a productos exclusivos y ediciones limitadas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Proceso de Aprobación
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Envío de Solicitud</h4>
                      <p className="text-xs text-muted-foreground">
                        Completa el formulario con tus datos y documentos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Revisión Manual</h4>
                      <p className="text-xs text-muted-foreground">
                        Nuestro equipo revisa cuidadosamente tu solicitud
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Respuesta (3-5 días)</h4>
                      <p className="text-xs text-muted-foreground">
                        Te contactamos por email con la decisión
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Activación</h4>
                      <p className="text-xs text-muted-foreground">
                        Si eres aprobado, recibes acceso inmediato
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Criterios de Selección
                </h3>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Exclusividad:</strong> 
                    Buscamos miembros que valoren la calidad y la experiencia premium.
                  </p>
                  <p>
                    <strong className="text-foreground">Compromiso:</strong> 
                    Preferimos clientes que aprovechen activamente los beneficios.
                  </p>
                  <p>
                    <strong className="text-foreground">Comunidad:</strong> 
                    Valoramos miembros que contribuyan positivamente a nuestro club.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  ¿Necesitas Ayuda?
                </h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Si tienes preguntas sobre el proceso de solicitud o los beneficios 
                    de la membresía, no dudes en contactarnos.
                  </p>
                  <a
                    href="/contacto"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    Ir a la página de contacto →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center animate-slide-up">
          <div className="bg-gradient-green-light rounded-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Membresía Limitada y Exclusiva
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Club W mantiene un número limitado de miembros para garantizar 
              la mejor experiencia de compra y atención personalizada para cada uno.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> La membresía está sujeta a aprobación y puede 
              requerir lista de espera en períodos de alta demanda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}