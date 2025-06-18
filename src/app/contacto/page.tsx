import { Metadata } from 'next'
import ContactForm from '@/components/forms/ContactForm'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto - Club W',
  description: 'Ponte en contacto con Club W. Estamos aquí para ayudarte con cualquier consulta sobre tu membresía o nuestros productos exclusivos.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes alguna pregunta sobre Club W o necesitas ayuda con tu membresía? 
            Estamos aquí para asistirte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2 animate-slide-up">
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6 animate-slide-up">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  Información de Contacto
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Email</h4>
                      <p className="text-muted-foreground">contacto@clubw.com</p>
                      <p className="text-sm text-muted-foreground">
                        Respuesta en 24 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Teléfono</h4>
                      <p className="text-muted-foreground">+56 9 1234 5678</p>
                      <p className="text-sm text-muted-foreground">
                        Lunes a Viernes, 9:00 - 18:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Ubicación</h4>
                      <p className="text-muted-foreground">
                        Santiago, Chile
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Atención solo para miembros
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Horarios</h4>
                      <div className="text-muted-foreground text-sm space-y-1">
                        <p>Lunes - Viernes: 9:00 - 18:00</p>
                        <p>Sábados: 10:00 - 14:00</p>
                        <p>Domingos: Cerrado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">¿Necesitas ayuda rápida?</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Preguntas sobre membresía</h4>
                    <p className="text-muted-foreground text-sm">
                      Consulta nuestras preguntas frecuentes o solicita información sobre cómo unirte.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Soporte técnico</h4>
                    <p className="text-muted-foreground text-sm">
                      Problemas con tu cuenta o navegación en el sitio web.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Consultas comerciales</h4>
                    <p className="text-muted-foreground text-sm">
                      Información sobre productos, precios y colaboraciones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center animate-slide-up">
          <div className="bg-gradient-green-light rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">
              ¿Aún no eres miembro de <span className="text-gradient">Club W</span>?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Solicita tu membresía y accede a productos exclusivos con precios especiales 
              solo para miembros verificados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/solicitud-acceso"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Solicitar Membresía
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-border bg-background text-foreground font-medium rounded-md hover:bg-accent transition-colors"
              >
                Conocer más
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}