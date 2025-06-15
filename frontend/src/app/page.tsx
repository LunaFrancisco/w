import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ShoppingBag, 
  Users, 
  Shield, 
  Truck, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Heart,
  Gift,
  Award
} from 'lucide-react'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Bienvenido a{' '}
                <span className="text-gradient">Club W</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Tu club privado de compras exclusivas con acceso a productos premium 
                y precios especiales solo para miembros verificados.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="gradient-green text-white border-0 px-8 py-4 text-lg" asChild>
                <Link href="/solicitud-acceso">
                  <Users className="w-5 h-5 mr-2" />
                  Únete al Club
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
                <Link href="/contacto">
                  Más Información
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="pt-8 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Membresía Exclusiva</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Productos Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Precios Especiales</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold">
              ¿Por qué elegir <span className="text-gradient">Club W</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ofrecemos una experiencia de compra única y exclusiva para nuestros miembros verificados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 bg-gradient-green-light hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Membresía Exclusiva</h3>
                <p className="text-muted-foreground">
                  Solo miembros verificados pueden acceder a nuestro catálogo premium y ofertas especiales.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-green-light hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Productos Premium</h3>
                <p className="text-muted-foreground">
                  Curación especial de productos de alta calidad con marcas reconocidas y exclusivas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-green-light hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Precios Especiales</h3>
                <p className="text-muted-foreground">
                  Descuentos exclusivos y precios preferenciales solo disponibles para miembros del club.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-green-light hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Envío Rápido</h3>
                <p className="text-muted-foreground">
                  Entrega rápida y segura en toda la Región Metropolitana y principales ciudades.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-green-light hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Atención Personalizada</h3>
                <p className="text-muted-foreground">
                  Soporte dedicado y atención personalizada para cada uno de nuestros miembros.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-green-light hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Garantía de Calidad</h3>
                <p className="text-muted-foreground">
                  Todos nuestros productos pasan por rigurosos controles de calidad antes del envío.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Sobre <span className="text-gradient">Club W</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Club W nació con la visión de crear una experiencia de compra única y exclusiva 
                  para clientes que valoran la calidad y la excelencia en el servicio.
                </p>
                <p>
                  Nuestro modelo de membresía nos permite mantener un estándar alto en la selección 
                  de productos y ofrecer precios especiales que no encontrarás en ningún otro lugar.
                </p>
                <p>
                  Cada miembro de Club W forma parte de una comunidad seleccionada que disfruta 
                  de beneficios exclusivos, atención personalizada y acceso a productos premium.
                </p>
              </div>
              <div className="pt-4">
                <Button size="lg" className="gradient-green text-white border-0" asChild>
                  <Link href="/solicitud-acceso">
                    Conoce más sobre la membresía
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="aspect-square rounded-2xl gradient-green-light p-8 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 gradient-green rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-12 h-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gradient">Experiencia Premium</h3>
                    <p className="text-muted-foreground">
                      Más que una tienda, somos tu club de compras exclusivo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold">
              ¿Listo para unirte a <span className="text-gradient">Club W</span>?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Solicita tu membresía hoy y comienza a disfrutar de una experiencia de compra 
              exclusiva con productos premium y precios especiales.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="gradient-green text-white border-0 px-10 py-4 text-lg" asChild>
                <Link href="/solicitud-acceso">
                  <Users className="w-5 h-5 mr-2" />
                  Solicitar Membresía
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg" asChild>
                <Link href="/contacto">
                  Contáctanos
                </Link>
              </Button>
            </div>

            <div className="pt-8 text-sm text-muted-foreground">
              <p>
                ¿Ya eres miembro?{' '}
                <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}