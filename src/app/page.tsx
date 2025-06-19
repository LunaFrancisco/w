import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  Shield, 
  Star, 
  ArrowRight,
  Heart,
  Award,
  Sparkles,
  Crown,
  Zap,
  TrendingUp,
  Lock,
  Globe
} from 'lucide-react'
import { GtmEvent } from '@next/third-parties/google'

export default function HomePage() {
  return (
    <>
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in-down">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">Club de Membresía Premium</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>

            <div className="space-y-6 animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white">
                Bienvenido a{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    Club W
                  </span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-teal-400/20 blur-xl" />
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                El club más exclusivo de Santiago. Accede a productos premium, 
                ofertas únicas y una experiencia de compra sin igual.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in-up animation-delay-200">
              <Button 
                size="lg" 
                className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25"
                asChild
              >
                <Link href="/solicitud-acceso" onClick={() => {GtmEvent({ event: 'join_club', label: 'Únete Ahora Button Clicked' })}}>
                  <span className="relative z-10 flex items-center">
                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                    Únete Ahora
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg font-semibold border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40 rounded-xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/contacto">
                  Descubre Más
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              <div className="flex flex-col items-center gap-2 text-white/80">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <span className="text-sm font-medium">5.0 de calificación</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/80">
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">+1,000 miembros activos</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-white/80">
                <Shield className="w-6 h-6" />
                <span className="text-sm font-medium">100% Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </section>

      {/* Features Section with 3D Cards */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full animate-fade-in-down">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Beneficios Exclusivos</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 animate-fade-in-up">
              ¿Por qué elegir{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Club W
              </span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Descubre una nueva forma de comprar con privilegios únicos diseñados para ti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Acceso VIP",
                description: "Productos exclusivos antes que nadie, solo para miembros verificados del club.",
                gradient: "from-violet-500 to-purple-600",
                delay: "0"
              },
              {
                icon: TrendingUp,
                title: "Hasta 70% OFF",
                description: "Descuentos increíbles en marcas premium que no encontrarás en ningún otro lugar.",
                gradient: "from-emerald-500 to-teal-600",
                delay: "100"
              },
              {
                icon: Globe,
                title: "Marcas Globales",
                description: "Acceso a las mejores marcas internacionales con envío directo a tu puerta.",
                gradient: "from-blue-500 to-cyan-600",
                delay: "200"
              },
              {
                icon: Zap,
                title: "Flash Sales",
                description: "Ofertas relámpago exclusivas con stocks limitados para nuestros miembros.",
                gradient: "from-orange-500 to-red-600",
                delay: "300"
              },
              {
                icon: Heart,
                title: "Concierge Personal",
                description: "Asistencia personalizada 24/7 para todas tus necesidades de compra.",
                gradient: "from-pink-500 to-rose-600",
                delay: "400"
              },
              {
                icon: Award,
                title: "Programa de Puntos",
                description: "Acumula puntos con cada compra y canjéalos por productos exclusivos.",
                gradient: "from-amber-500 to-yellow-600",
                delay: "500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative animate-fade-in-up animation-delay-${feature.delay}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10 ${feature.gradient}" />
                <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-500 group-hover:${feature.gradient}">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "1K+", label: "Miembros Activos", icon: Users },
              { value: "500+", label: "Marcas Premium", icon: Award },
              { value: "98%", label: "Satisfacción", icon: Star },
              { value: "24/7", label: "Soporte VIP", icon: Heart }
            ].map((stat, index) => (
              <div key={index} className="space-y-3 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <stat.icon className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-4xl lg:text-5xl font-bold text-white">{stat.value}</div>
                <div className="text-sm lg:text-base text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full animate-fade-in-down">
              <Star className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Testimonios</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 animate-fade-in-up">
              Lo que dicen nuestros{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                miembros
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Miembro Gold",
                content: "Club W cambió completamente mi forma de comprar. Los descuentos son reales y la calidad es excepcional.",
                rating: 5
              },
              {
                name: "Carlos Rodríguez",
                role: "Miembro Platinum",
                content: "El servicio de concierge es increíble. Siempre encuentran exactamente lo que busco al mejor precio.",
                rating: 5
              },
              {
                name: "Ana Martínez",
                role: "Miembro Gold",
                content: "Las marcas exclusivas y los flash sales hacen que valga cada peso de la membresía. ¡100% recomendado!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-8 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">{testimonial.content}</p>
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 -translate-y-1/2 -left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -translate-y-1/2 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in-down">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Oferta por tiempo limitado</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white animate-fade-in-up">
              Tu vida premium{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                comienza aquí
              </span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Únete hoy y recibe 30% de descuento en tu primera compra + envío gratis de por vida
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8 animate-fade-in-up animation-delay-400">
              <Button 
                size="lg" 
                className="group relative px-10 py-7 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/50"
                asChild
              >
                <Link href="/solicitud-acceso">
                  <Crown className="w-6 h-6 mr-3" />
                  Obtener Membresía VIP
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </Button>
            </div>

            <div className="pt-8 text-white/60 animate-fade-in-up animation-delay-600">
              <p className="text-sm">
                Sin compromisos • Cancela cuando quieras • Garantía de satisfacción
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}