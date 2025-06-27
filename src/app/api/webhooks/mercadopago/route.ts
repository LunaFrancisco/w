import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { getPaymentStatus, getOrderStatus, validateWebhookSignature } from '@/lib/mercadopago'

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN environment variable is required')
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('MercadoPago webhook received - Type:', body.type)

    // Verificar que es una notificación de pago o merchant order
    if (body.type !== 'payment' && body.type !== 'topic_merchant_order_wh') {
      console.log(`Skipping ${body.type} notification`)
      return NextResponse.json({ message: 'Notification type not supported' }, { status: 200 })
    }

    // Si es merchant_order, solo confirmamos recepción (no se puede validar según la doc)
    if (body.type === 'topic_merchant_order_wh') {
      return NextResponse.json({ message: 'Merchant order webhook received' }, { status: 200 })
    }

    // Validar la firma del webhook solo para pagos
    if (!validateWebhookSignature(request)) {
      console.error('Webhook signature validation failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('Webhook signature validated successfully')

    const paymentId = body.data?.id
    if (!paymentId) {
      console.error('No payment ID in webhook')
      return NextResponse.json({ error: 'No payment ID provided' }, { status: 400 })
    }

    // Obtener información del pago desde MercadoPago
    const mpPayment = await payment.get({ id: paymentId })
    
    if (!mpPayment) {
      console.error('Payment not found in MercadoPago:', paymentId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('MercadoPago payment data:', mpPayment)

    const externalReference = mpPayment.external_reference
    if (!externalReference) {
      console.error('No external reference in payment')
      return NextResponse.json({ error: 'No external reference' }, { status: 400 })
    }

    // Buscar la orden en nuestra base de datos
    const order = await prisma.order.findUnique({
      where: { id: externalReference },
      include: {
        payments: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      console.error('Order not found:', externalReference)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Convertir status de MercadoPago a nuestro enum
    const paymentStatus = getPaymentStatus(mpPayment.status || 'pending')
    const orderStatus = getOrderStatus(paymentStatus)

    // Buscar si ya existe un registro de pago para este paymentId
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { mercadopagoId: paymentId.toString() },
          { collector_id: mpPayment.collector_id?.toString() }
        ]
      }
    })

    if (existingPayment) {
      // Actualizar pago existente
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          mercadopagoId: paymentId.toString(),
          collector_id: mpPayment.collector_id?.toString(),
          status: paymentStatus,
          statusDetail: mpPayment.status_detail,
          paymentType: mpPayment.payment_type_id,
          paymentMethod: mpPayment.payment_method_id,
          transactionAmount: mpPayment.transaction_amount ? Number(mpPayment.transaction_amount) : null,
          dateCreated: mpPayment.date_created ? new Date(mpPayment.date_created) : null,
          dateApproved: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
        }
      })
    } else {
      // Crear nuevo registro de pago
      await prisma.payment.create({
        data: {
          orderId: order.id,
          mercadopagoId: paymentId.toString(),
          collector_id: mpPayment.collector_id?.toString(),
          preferenceId: order.preferenceId,
          status: paymentStatus,
          statusDetail: mpPayment.status_detail,
          paymentType: mpPayment.payment_type_id,
          paymentMethod: mpPayment.payment_method_id,
          amount: Number(order.total),
          transactionAmount: mpPayment.transaction_amount ? Number(mpPayment.transaction_amount) : null,
          currency: mpPayment.currency_id || 'CLP',
          externalReference: externalReference,
          dateCreated: mpPayment.date_created ? new Date(mpPayment.date_created) : null,
          dateApproved: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
        }
      })
    }

    // Actualizar el estado de la orden
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: paymentStatus,
        status: orderStatus
      }
    })

    // Si el pago fue aprobado, reducir el stock de los productos
    if (paymentStatus === 'APPROVED' && order.status === 'PENDING') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }
    }

    console.log(`Order ${order.id} updated with payment status: ${paymentStatus}`)

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 })

  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
