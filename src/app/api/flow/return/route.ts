import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Flow Return POST Received ===')
    console.log('URL:', request.url)
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    // Extraer order_id de la URL
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    
    console.log('Flow return POST for order:', orderId)
    
    // Flow puede enviar datos de formulario también
    try {
      const formData = await request.formData()
      console.log('Flow return form data:', Object.fromEntries(formData.entries()))
    } catch (error) {
      console.log('No form data in return POST')
    }
    
    // Redirigir al GET de la página de éxito
    const successUrl = orderId 
      ? `/checkout/success?order_id=${orderId}`
      : '/checkout/success'
    
    console.log('Redirecting to:', successUrl)
    
    // Devolver una respuesta HTML con redirección automática
    const redirectHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Procesando...</title>
          <meta http-equiv="refresh" content="0;url=${successUrl}">
        </head>
        <body>
          <p>Procesando pago... Redirigiendo...</p>
          <script>
            window.location.href = '${successUrl}';
          </script>
        </body>
      </html>
    `
    
    return new Response(redirectHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Error processing Flow return POST:', error)
    
    // En caso de error, redirigir a página de éxito genérica
    const redirectHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pago Procesado</title>
          <meta http-equiv="refresh" content="2;url=/checkout/success">
        </head>
        <body>
          <p>Pago procesado. Redirigiendo...</p>
          <script>
            setTimeout(function() {
              window.location.href = '/checkout/success';
            }, 2000);
          </script>
        </body>
      </html>
    `
    
    return new Response(redirectHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== Flow Return GET Received ===')
    
    // Extraer order_id de la URL
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    
    console.log('Flow return GET for order:', orderId)
    
    // Redirigir al GET de la página de éxito
    const successUrl = orderId 
      ? `/checkout/success?order_id=${orderId}`
      : '/checkout/success'
    
    return NextResponse.redirect(new URL(successUrl, request.url))

  } catch (error) {
    console.error('Error processing Flow return GET:', error)
    return NextResponse.redirect(new URL('/checkout/success', request.url))
  }
}