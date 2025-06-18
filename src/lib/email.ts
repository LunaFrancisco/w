import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: {
    name: string
    street: string
    commune: string
    city: string
    region: string
  }
}

interface OrderStatusUpdateEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  newStatus: string
  statusMessage: string
}

export async function sendOrderConfirmationEmail({
  orderNumber,
  customerName,
  customerEmail,
  items,
  subtotal,
  shippingCost,
  total,
  shippingAddress
}: OrderConfirmationEmailProps) {
  try {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(price)
    }

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.name}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `).join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Confirmación de Pedido - Club W</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Club W</h1>
            <h2 style="color: #374151; margin-top: 0;">¡Gracias por tu pedido!</h2>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Hola ${customerName},</h3>
            <p>Hemos recibido tu pedido y lo estamos procesando. Te enviaremos actualizaciones sobre el estado de tu envío.</p>
            <p><strong>Número de pedido:</strong> #${orderNumber}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Productos</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Producto</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">Cant.</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Resumen del Pedido</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;">Subtotal:</td>
                <td style="text-align: right; padding: 8px 0;">${formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">Envío:</td>
                <td style="text-align: right; padding: 8px 0;">${formatPrice(shippingCost)}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb; font-weight: bold; font-size: 1.1em;">
                <td style="padding: 12px 0;">Total:</td>
                <td style="text-align: right; padding: 12px 0;">${formatPrice(total)}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Dirección de Entrega</h3>
            <p style="margin: 0;">
              <strong>${shippingAddress.name}</strong><br>
              ${shippingAddress.street}<br>
              ${shippingAddress.commune}, ${shippingAddress.city}<br>
              ${shippingAddress.region}
            </p>
          </div>

          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #1e40af;">¿Qué sigue?</h4>
            <p style="margin-bottom: 0;">Te enviaremos un email cuando tu pedido esté en camino. Puedes revisar el estado de tu pedido en cualquier momento en tu cuenta de Club W.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ¿Necesitas ayuda? Contáctanos en 
              <a href="mailto:support@clubw.com" style="color: #1e40af;">support@clubw.com</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
              © 2025 Club W. Todos los derechos reservados.
            </p>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Club W <no-reply@clubw.com>',
      to: [customerEmail],
      subject: `Confirmación de Pedido #${orderNumber} - Club W`,
      html: emailHtml,
    })

    if (error) {
      console.error('Error sending order confirmation email:', error)
      throw error
    }

    console.log('Order confirmation email sent:', data)
    return data

  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
    throw error
  }
}

export async function sendOrderStatusUpdateEmail({
  orderNumber,
  customerName,
  customerEmail,
  newStatus,
  statusMessage
}: OrderStatusUpdateEmailProps) {
  try {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'PAID':
          return '#3b82f6'
        case 'PREPARING':
          return '#8b5cf6'
        case 'SHIPPED':
          return '#6366f1'
        case 'DELIVERED':
          return '#10b981'
        case 'CANCELLED':
          return '#ef4444'
        default:
          return '#6b7280'
      }
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Actualización de Pedido - Club W</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Club W</h1>
            <h2 style="color: #374151; margin-top: 0;">Actualización de tu Pedido</h2>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Hola ${customerName},</h3>
            <p>Tenemos una actualización sobre tu pedido:</p>
            <p><strong>Número de pedido:</strong> #${orderNumber}</p>
            <div style="background-color: ${getStatusColor(newStatus)}; color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0; text-align: center; font-weight: bold; font-size: 1.1em;">
                ${statusMessage}
              </p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/pedidos" 
               style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Ver detalles del pedido
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ¿Necesitas ayuda? Contáctanos en 
              <a href="mailto:support@clubw.com" style="color: #1e40af;">support@clubw.com</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
              © 2025 Club W. Todos los derechos reservados.
            </p>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Club W <no-reply@clubw.com>',
      to: [customerEmail],
      subject: `Actualización de Pedido #${orderNumber} - Club W`,
      html: emailHtml,
    })

    if (error) {
      console.error('Error sending order status update email:', error)
      throw error
    }

    console.log('Order status update email sent:', data)
    return data

  } catch (error) {
    console.error('Failed to send order status update email:', error)
    throw error
  }
}