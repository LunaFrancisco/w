import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createFlowPayment } from '@/lib/flow'
import { z } from 'zod'

const createFlowPaymentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive()
  })),
  addressId: z.string(),
  shippingCost: z.number().min(0)
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createFlowPaymentSchema.parse(body)

    // Verificar que la dirección pertenece al usuario
    const address = await prisma.address.findFirst({
      where: {
        id: validatedData.addressId,
        userId: session.user.id
      }
    })

    if (!address) {
      return NextResponse.json({ error: 'Dirección no válida' }, { status: 400 })
    }

    // Verificar productos y stock
    const productIds = validatedData.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true
      }
    })

    if (products.length !== validatedData.items.length) {
      return NextResponse.json({ error: 'Algunos productos no están disponibles' }, { status: 400 })
    }

    // Verificar stock y calcular totales
    let subtotal = 0
    const orderItems = []

    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json({ error: `Producto ${item.name} no encontrado` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 })
      }

      const itemTotal = Number(product.price) * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      })
    }

    const total = subtotal + validatedData.shippingCost

    // Crear la orden en la base de datos
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        addressId: validatedData.addressId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal: subtotal,
        shippingCost: validatedData.shippingCost,
        total: total,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        address: true
      }
    })

    // Preparar datos para Flow.cl
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000/'
    
    // Crear el comerceOrder único para Flow (máximo 45 caracteres)
    // Usar los últimos 8 caracteres del UUID + timestamp acortado
    const shortOrderId = order.id.slice(-8)
    const shortTimestamp = Date.now().toString().slice(-8) // Últimos 8 dígitos
    const commerceOrder = `ORD-${shortOrderId}-${shortTimestamp}` // ORD-12345678-12345678 = 25 chars
    
    console.log('Commerce order created:', { 
      commerceOrder, 
      length: commerceOrder.length,
      maxAllowed: 45 
    })
    
    // Crear descripción del pedido
    const itemDescriptions = order.items.map(item => 
      `${item.quantity}x ${item.product.name}`
    ).join(', ')
    
    const subject = `Pedido #${order.id.slice(-8)} - ${itemDescriptions}`.substring(0, 255)

    // Usar nuestras URLs reales ahora que conocemos el problema
    const confirmationUrl = `${baseUrl}/api/webhooks/flow/`
    const returnUrl = `${baseUrl}/api/flow/return?order_id=${order.id}`

    const flowPaymentData = {
      commerceOrder: commerceOrder,
      subject: subject.substring(0, 100), // Limitar subject a 100 chars por seguridad
      amount: Math.round(total), // Flow requiere enteros
      email: order.user.email,
      urlConfirmation: confirmationUrl,
      urlReturn: returnUrl,
      currency: 'CLP',
      timeout: 900, // 15 minutos
    }

    // Validar todos los parámetros para debugging
    console.log('Flow parameters validation:', {
      commerceOrder: flowPaymentData.commerceOrder,
      commerceOrderLength: flowPaymentData.commerceOrder.length,
      subject: flowPaymentData.subject,
      subjectLength: flowPaymentData.subject.length,
      urlConfirmation: flowPaymentData.urlConfirmation,
      urlConfirmationLength: flowPaymentData.urlConfirmation.length,
      urlReturn: flowPaymentData.urlReturn,
      urlReturnLength: flowPaymentData.urlReturn.length,
      email: flowPaymentData.email,
      emailLength: flowPaymentData.email.length,
      amount: flowPaymentData.amount,
      currency: flowPaymentData.currency,
      timeout: flowPaymentData.timeout
    })

    console.log('Creating Flow payment with data:', flowPaymentData)

    // Crear pago en Flow.cl
    const flowResponse = await createFlowPayment(flowPaymentData)

    if (!flowResponse.token) {
      throw new Error('No se recibió token de Flow.cl')
    }

    // Crear registro de pago inicial en nuestra BD
    await prisma.payment.create({
      data: {
        orderId: order.id,
        flowToken: flowResponse.token,
        flowOrderId: flowResponse.flowOrder?.toString(),
        paymentGateway: 'FLOW',
        status: 'PENDING',
        amount: total,
        currency: 'CLP',
        externalReference: commerceOrder
      }
    })

    console.log('Flow payment created successfully:', {
      token: flowResponse.token,
      flowOrder: flowResponse.flowOrder,
      url: flowResponse.url
    })

    // Construir la URL completa con el token según documentación de Flow
    const fullPaymentUrl = `${flowResponse.url}?token=${flowResponse.token}`
    
    console.log('Redirecting user to Flow payment page:', fullPaymentUrl)

    return NextResponse.json({
      orderId: order.id,
      token: flowResponse.token,
      flowOrder: flowResponse.flowOrder,
      paymentUrl: fullPaymentUrl, // URL completa con token
      commerceOrder: commerceOrder
    })

  } catch (error) {
    console.error('Error creating Flow payment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    // Errores específicos de Flow
    if (error instanceof Error && error.message.includes('Flow API error')) {
      return NextResponse.json({ 
        error: 'Error en la pasarela de pago Flow.cl',
        details: error.message 
      }, { status: 502 })
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}