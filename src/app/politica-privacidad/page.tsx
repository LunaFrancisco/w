import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Shield, Eye, Lock, Users, FileText, Mail, Calendar } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            En Club W valoramos y protegemos tu privacidad. Esta política explica cómo recopilamos, 
            utilizamos y protegemos tu información personal.
          </p>
          <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            Última actualización: 18 de junio de 2025
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <FileText className="w-5 h-5 mr-2" />
              Navegación Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="#informacion-recopilada" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Información que recopilamos
              </a>
              <a href="#uso-informacion" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Uso de la información
              </a>
              <a href="#compartir-informacion" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Compartir información
              </a>
              <a href="#proteccion-datos" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Protección de datos
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Información que recopilamos */}
          <Card id="informacion-recopilada" className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Eye className="w-6 h-6 mr-3 text-orange-500" />
                1. Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-3">Información Personal</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Nombre completo y datos de contacto
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Dirección de correo electrónico
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Número de teléfono
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Direcciones de entrega y facturación
                    </li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-3">Información de Uso</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Historial de navegación en nuestro sitio
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Preferencias de productos y compras
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Información del dispositivo y navegador
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Cookies y tecnologías similares
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uso de la información */}
          <Card id="uso-informacion" className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Users className="w-6 h-6 mr-3 text-blue-500" />
                2. Cómo Utilizamos tu Información
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Procesamiento de Pedidos</h3>
                  <p className="text-gray-600 text-sm">
                    Para procesar tus compras, gestionar entregas y proporcionarte servicio al cliente.
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-2">Comunicación</h3>
                  <p className="text-gray-600 text-sm">
                    Para enviarte actualizaciones de pedidos, ofertas especiales y comunicaciones importantes.
                  </p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-2">Mejora del Servicio</h3>
                  <p className="text-gray-600 text-sm">
                    Para personalizar tu experiencia y mejorar nuestros productos y servicios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compartir información */}
          <Card id="compartir-informacion" className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Users className="w-6 h-6 mr-3 text-red-500" />
                3. Compartir tu Información
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-red-900 mb-3">🔒 Compromiso de Privacidad</h3>
                <p className="text-gray-700">
                  <strong>Nunca vendemos tu información personal.</strong> Solo compartimos datos en circunstancias específicas y limitadas:
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1 text-white text-sm font-bold">1</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Proveedores de Servicios</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Con empresas de logística, procesadores de pago y servicios técnicos que nos ayudan a operar.
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1 text-white text-sm font-bold">2</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cumplimiento Legal</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Cuando sea requerido por ley o para proteger nuestros derechos legales.
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1 text-white text-sm font-bold">3</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Con tu Consentimiento</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      En cualquier otra situación, solo con tu autorización explícita.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Protección de datos */}
          <Card id="proteccion-datos" className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Lock className="w-6 h-6 mr-3 text-green-500" />
                4. Protección de tus Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-900 mb-4">Medidas de Seguridad</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Encriptación SSL/TLS</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Servidores seguros</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Acceso restringido</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Monitoreo continuo</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-4">Tus Derechos</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Acceder a tus datos</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Corregir información</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Eliminar cuenta</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">Portabilidad de datos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Eye className="w-6 h-6 mr-3 text-yellow-500" />
                5. Cookies y Tecnologías de Seguimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Utilizamos cookies para mejorar tu experiencia de navegación, recordar tus preferencias y 
                  analizar el tráfico del sitio web.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-semibold text-yellow-900 mb-2">Esenciales</h4>
                    <p className="text-sm text-gray-600">Necesarias para el funcionamiento del sitio</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-semibold text-yellow-900 mb-2">Analíticas</h4>
                    <p className="text-sm text-gray-600">Para entender cómo usas nuestro sitio</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <h4 className="font-semibold text-yellow-900 mb-2">Marketing</h4>
                    <p className="text-sm text-gray-600">Para mostrarte contenido relevante</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-gradient-to-r from-orange-500 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Mail className="w-6 h-6 mr-3" />
                ¿Preguntas sobre tu Privacidad?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4 text-orange-100">
                    Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, 
                    no dudes en contactarnos.
                  </p>
                  <div className="space-y-2">
                    <p className="flex items-center text-orange-100">
                      <Mail className="w-4 h-4 mr-2" />
                      privacidad@clubw.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Link
                    href="/contacto"
                    className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Esta política de privacidad puede actualizarse periódicamente. Te notificaremos sobre cambios importantes.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}