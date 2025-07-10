import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Scale, FileText, ShoppingCart, CreditCard, Truck, AlertTriangle, Calendar, Mail } from 'lucide-react'

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estos términos y condiciones rigen el uso de nuestros servicios en Club W. 
            Al utilizar nuestro sitio web, aceptas estos términos.
          </p>
          <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            Última actualización: 18 de junio de 2025
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <FileText className="w-5 h-5 mr-2" />
              Navegación Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="#condiciones-uso" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Condiciones de uso
              </a>
              <a href="#compras-pagos" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Compras y pagos
              </a>
              <a href="#envios-entregas" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Envíos y entregas
              </a>
              <a href="#responsabilidades" className="text-blue-600 hover:text-blue-800 transition-colors">
                → Responsabilidades
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Condiciones de Uso */}
          <Card id="condiciones-uso" className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Scale className="w-6 h-6 mr-3 text-blue-500" />
                1. Condiciones Generales de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Aceptación de Términos</h3>
                <p className="text-gray-700 mb-4">
                  Al acceder y utilizar este sitio web, aceptas estar sujeto a estos términos y condiciones de uso, 
                  todas las leyes y regulaciones aplicables, y aceptas que eres responsable del cumplimiento de 
                  cualquier ley local aplicable.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Uso Permitido</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Navegación y compra de productos
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Creación de cuenta personal
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Contacto con servicio al cliente
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Uso Prohibido</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Actividades ilegales o fraudulentas
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Interferir con el funcionamiento del sitio
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Uso comercial no autorizado
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compras y Pagos */}
          <Card id="compras-pagos" className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <ShoppingCart className="w-6 h-6 mr-3 text-green-500" />
                2. Compras y Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">Proceso de Compra</h3>
                  <p className="text-gray-700">
                    Todas las compras están sujetas a disponibilidad y confirmación del precio. 
                    Nos reservamos el derecho de cancelar cualquier pedido si no podemos cumplir con él.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Métodos de Pago</h4>
                    <p className="text-gray-600 text-sm">
                      Aceptamos tarjetas de crédito, débito y transferencias bancarias seguras.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Confirmación</h4>
                    <p className="text-gray-600 text-sm">
                      Recibirás confirmación por email una vez procesado tu pedido.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Precios</h4>
                    <p className="text-gray-600 text-sm">
                      Todos los precios incluyen IVA. Los precios pueden cambiar sin previo aviso.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Política de Cancelación
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-1 text-white text-sm font-bold">1</span>
                      <div>
                        <p className="text-gray-700">
                          <strong>Antes del envío:</strong> Puedes cancelar tu pedido sin costo alguno.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-1 text-white text-sm font-bold">2</span>
                      <div>
                        <p className="text-gray-700">
                          <strong>Después del envío:</strong> Aplican políticas de devolución estándar.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-1 text-white text-sm font-bold">3</span>
                      <div>
                        <p className="text-gray-700">
                          <strong>Reembolsos:</strong> Se procesan en 5-10 días hábiles después de la cancelación.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Envíos y Entregas */}
          <Card id="envios-entregas" className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Truck className="w-6 h-6 mr-3 text-purple-500" />
                3. Envíos y Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-3">Política de Envíos</h3>
                  <p className="text-gray-700">
                    Nos esforzamos por entregar todos los pedidos en los tiempos estimados, 
                    pero los tiempos de entrega pueden variar según la ubicación y disponibilidad.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Tiempos de Entrega</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Santiago (RM)</span>
                        <span className="font-medium">1-2 días hábiles</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Regiones</span>
                        <span className="font-medium">3-5 días hábiles</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Zonas extremas</span>
                        <span className="font-medium">5-7 días hábiles</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Costos de Envío</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Envío estándar</span>
                        <span className="font-medium">$2.990</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Envío express</span>
                        <span className="font-medium">$4.990</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Compras +$50.000</span>
                        <span className="font-medium text-green-600">Gratis</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-3">Responsabilidad de Entrega</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Es responsabilidad del cliente proporcionar una dirección de entrega correcta y completa
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Club W no se hace responsable por entregas fallidas debido a información incorrecta
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Los productos no recogidos serán devueltos y pueden aplicar cargos adicionales
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Devoluciones y Garantías */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-500" />
                4. Devoluciones y Garantías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-3">Política de Devoluciones</h3>
                  <p className="text-gray-700">
                    Aceptamos devoluciones dentro de los 30 días posteriores a la entrega, 
                    siempre que los productos estén en condiciones originales.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">✅ Productos Devolvibles</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Productos sin usar en empaque original</li>
                      <li>• Artículos defectuosos o dañados</li>
                      <li>• Productos que no coinciden con la descripción</li>
                      <li>• Tallas incorrectas (ropa y calzado)</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3">❌ Productos No Devolvibles</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Productos personalizados</li>
                      <li>• Artículos de higiene personal</li>
                      <li>• Productos perecederos</li>
                      <li>• Artículos usados o dañados por el cliente</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Proceso de Devolución</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">1</div>
                      <p className="text-sm text-gray-700">Contacta servicio al cliente</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">2</div>
                      <p className="text-sm text-gray-700">Obtén código de devolución</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">3</div>
                      <p className="text-sm text-gray-700">Envía el producto</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">4</div>
                      <p className="text-sm text-gray-700">Recibe tu reembolso</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsabilidades */}
          <Card id="responsabilidades" className="border-l-4 border-l-gray-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Scale className="w-6 h-6 mr-3 text-gray-500" />
                5. Limitación de Responsabilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Club W se esfuerza por proporcionar información precisa y servicios de calidad, 
                    sin embargo, no garantizamos que el sitio web esté libre de errores o interrupciones.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Limitaciones</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Disponibilidad del sitio web</li>
                        <li>• Precisión de precios y descripciones</li>
                        <li>• Compatibilidad con dispositivos</li>
                        <li>• Interrupciones del servicio</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Exclusiones</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Daños indirectos o consecuentes</li>
                        <li>• Pérdida de datos o beneficios</li>
                        <li>• Uso indebido de productos</li>
                        <li>• Decisiones basadas en la información del sitio</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modificaciones */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <FileText className="w-6 h-6 mr-3 text-indigo-500" />
                6. Modificaciones de los Términos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
                  Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
                </p>
                <div className="flex items-center p-4 bg-white rounded-lg">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Notificación de Cambios</h4>
                    <p className="text-sm text-gray-600">
                      Te notificaremos por email sobre cambios importantes en nuestros términos y condiciones.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-gradient-to-r from-blue-500 to-green-600 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Mail className="w-6 h-6 mr-3" />
                ¿Tienes Dudas sobre estos Términos?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-4 text-blue-100">
                    Si tienes preguntas sobre estos términos y condiciones, nuestro equipo legal 
                    está disponible para ayudarte.
                  </p>
                  <div className="space-y-2">
                    <p className="flex items-center text-blue-100">
                      <Mail className="w-4 h-4 mr-2" />
                      legal@clubw.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Link
                    href="/contacto"
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
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
          <p className="text-gray-500 text-sm mb-4">
            Al continuar usando nuestros servicios, aceptas estos términos y condiciones en su totalidad.
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              href="/politica-privacidad"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}