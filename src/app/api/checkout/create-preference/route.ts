import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentPreference } from '@/lib/mercadopago'
import { z } from 'zod'

const createPreferenceSchema = z.object({
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
    const validatedData = createPreferenceSchema.parse(body)

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

    // Preparar items para MercadoPago
    const mpItems = order.items.map(item => ({
      id: item.product.id,
      title: item.product.name,
      description: item.product.description,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: 'CLP'
    }))

    // Agregar envío como item si tiene costo
    if (validatedData.shippingCost > 0) {
      mpItems.push({
        id: 'shipping',
        title: 'Envío',
        description: `Envío a ${address.commune}, ${address.city}`,
        quantity: 1,
        unit_price: validatedData.shippingCost,
        currency_id: 'CLP'
      })
    }

    // Crear preferencia en MercadoPago
    const baseUrl = 'https://mhsv1196-3000.brs.devtunnels.ms/'
    
    const preferenceData = {
      items: mpItems,
      external_reference: order.id,
      back_urls: {
        success: `${baseUrl}/checkout/success?order_id=${order.id}`,
        failure: `${baseUrl}/checkout/failure?order_id=${order.id}`,
        pending: `${baseUrl}/checkout/success?order_id=${order.id}`
      },
      auto_return: 'approved' as const,
      payer: {
        name: order.user.name?.split(' ')[0] || '',
        surname: order.user.name?.split(' ').slice(1).join(' ') || '',
        email: order.user.email,
      }
    }

    const preference = await createPaymentPreference(preferenceData)

    if (!preference.id) {
      throw new Error('No se pudo crear la preferencia de pago')
    }

    // Actualizar la orden con el preferenceId
    await prisma.order.update({
      where: { id: order.id },
      data: { preferenceId: preference.id }
    })

    // Crear registro de pago inicial
    await prisma.payment.create({
      data: {
        orderId: order.id,
        preferenceId: preference.id,
        status: 'PENDING',
        amount: total,
        currency: 'CLP',
        externalReference: order.id
      }
    })

    return NextResponse.json({
      preferenceId: preference.id,
      init_point: preference.init_point,
      orderId: order.id
    })

  } catch (error) {
    console.error('Error creating preference:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}