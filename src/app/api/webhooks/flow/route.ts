import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFlowPaymentStatus, convertFlowStatusToPaymentStatus, getFlowOrderStatus, validateFlowWebhookSignature } from '@/lib/flow'
import { calculateRequiredUnits } from '@/lib/stock-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Flow Webhook POST Received ===')
    console.log('URL:', request.url)
    console.log('Method:', request.method)
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    // Flow envía datos como application/x-www-form-urlencoded, no JSON
    const formData = await request.formData()
    const token = formData.get('token') as string
    
    console.log('Flow webhook data received:', {
      token,
      allFormData: Object.fromEntries(formData.entries())
    })

    // Flow envía el token en el formulario
    if (!token) {
      console.error('No token provided in Flow webhook')
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }

    // Opcional: validar la firma si Flow la proporciona
    const signature = request.headers.get('x-flow-signature')
    if (signature && !validateFlowWebhookSignature(token, signature)) {
      console.error('Flow webhook signature validation failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('Processing Flow webhook for token:', token)

    // Obtener información del pago desde Flow
    const flowPaymentStatus = await getFlowPaymentStatus(token)
    
    if (!flowPaymentStatus) {
      console.error('Payment not found in Flow:', token)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    console.log('Flow payment status:', flowPaymentStatus)

    // Buscar el pago en nuestra base de datos
    const payment = await prisma.payment.findFirst({
      where: { 
        flowToken: token 
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
                productVariant: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      console.error('Payment not found in database:', token)
      return NextResponse.json({ error: 'Payment not found in database' }, { status: 404 })
    }

    // Convertir status de Flow a nuestro enum
    const paymentStatus = convertFlowStatusToPaymentStatus(flowPaymentStatus.status)
    const orderStatus = getFlowOrderStatus(paymentStatus)

    console.log('Converting Flow status:', {
      flowStatus: flowPaymentStatus.status,
      paymentStatus,
      orderStatus
    })

    // Actualizar el registro de pago
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        flowOrderId: flowPaymentStatus.flowOrder?.toString(),
        flowStatus: flowPaymentStatus.status,
        status: paymentStatus,
        statusDetail: `Flow status: ${flowPaymentStatus.status}`,
        paymentMethod: flowPaymentStatus.paymentData?.media || null,
        transactionAmount: flowPaymentStatus.paymentData?.amount || null,
        dateCreated: flowPaymentStatus.requestDate ? new Date(flowPaymentStatus.requestDate) : null,
        dateApproved: flowPaymentStatus.paymentData?.date ? new Date(flowPaymentStatus.paymentData.date) : null,
      }
    })

    // Actualizar el estado de la orden
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: paymentStatus,
        status: orderStatus
      }
    })

    // Si el pago fue aprobado, reducir el stock de los productos
    if (paymentStatus === 'APPROVED' && payment.order.status === 'PENDING') {
      console.log('Payment approved, updating product stock...')
      
      for (const item of payment.order.items) {
        // Calcular las unidades reales a reducir del stock
        let unitsToReduce = item.quantity
        
        if (item.productVariantId && item.productVariant) {
          // Para variantes, calcular unidades reales usando el helper
          unitsToReduce = calculateRequiredUnits(item.quantity, item.productVariant.units)
        }
        // Para venta individual, item.quantity ya representa las unidades correctas
        
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: unitsToReduce
            }
          }
        })
        
        console.log(`Stock reduced for product ${item.product.name}: ${unitsToReduce} units (${item.quantity} ${item.productVariantId ? 'packs' : 'units'})`)
      }
    }

    // Log adicional para pagos rechazados
    if (paymentStatus === 'REJECTED' || paymentStatus === 'CANCELLED') {
      console.log(`Payment ${paymentStatus.toLowerCase()}: ${token}`, {
        reason: flowPaymentStatus.statusDetail || 'No details provided',
        flowOrder: flowPaymentStatus.flowOrder
      })
    }

    console.log(`Order ${payment.orderId} updated with Flow payment status: ${paymentStatus}`)

    return NextResponse.json({ 
      message: 'Flow webhook processed successfully',
      paymentStatus,
      orderStatus
    }, { status: 200 })

  } catch (error) {
    console.error('Error processing Flow webhook:', error)
    
    // Log detallado del error para debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Flow también puede enviar confirmaciones via GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }

    console.log('Flow GET confirmation for token:', token)

    // Procesar de la misma manera que POST
    const flowPaymentStatus = await getFlowPaymentStatus(token)
    
    if (!flowPaymentStatus) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Buscar y actualizar el pago (código similar al POST)
    const payment = await prisma.payment.findFirst({
      where: { flowToken: token }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found in database' }, { status: 404 })
    }

    const paymentStatus = convertFlowStatusToPaymentStatus(flowPaymentStatus.status)
    const orderStatus = getFlowOrderStatus(paymentStatus)

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        flowOrderId: flowPaymentStatus.flowOrder?.toString(),
        flowStatus: flowPaymentStatus.status,
        status: paymentStatus,
        statusDetail: `Flow status: ${flowPaymentStatus.status}`,
      }
    })

    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: paymentStatus,
        status: orderStatus
      }
    })

    console.log(`GET confirmation processed for order ${payment.orderId}`)

    return NextResponse.json({ 
      message: 'Flow confirmation processed successfully',
      paymentStatus 
    }, { status: 200 })

  } catch (error) {
    console.error('Error processing Flow GET confirmation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}