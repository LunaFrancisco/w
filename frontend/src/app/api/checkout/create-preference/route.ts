import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  createPaymentPreference, 
  formatCartItemsForMP, 
  formatPayerInfo, 
  formatShippingInfo 
} from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, addressId, shippingCost } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    if (!addressId) {
      return NextResponse.json(
        { error: 'Dirección de entrega requerida' },
        { status: 400 }
      )
    }

    // Get user's address
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id
      }
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // Validate stock for all items
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.name} no encontrado` },
          { status: 404 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotal = items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0)
    const total = subtotal + shippingCost

    // Create order in pending state
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        addressId: addressId,
        status: 'PENDING',
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        paymentStatus: 'pending'
      }
    })

    // Create order items
    await Promise.all(
      items.map((item: any) =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          }
        })
      )
    )

    // Format items for MercadoPago
    const mpItems = formatCartItemsForMP(items)
    
    // Add shipping as an item if it has a cost
    if (shippingCost > 0) {
      mpItems.push({
        id: 'shipping',
        title: 'Envío',
        description: `Envío a ${address.commune}`,
        quantity: 1,
        currency_id: 'CLP',
        unit_price: shippingCost
      })
    }

    // Create MercadoPago preference
    const preference = await createPaymentPreference({
      items: mpItems,
      payer: formatPayerInfo(session.user, address),
      external_reference: order.id,
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/checkout/success?order=${order.id}`,
        failure: `${process.env.NEXTAUTH_URL}/checkout/failure?order=${order.id}`,
        pending: `${process.env.NEXTAUTH_URL}/checkout/pending?order=${order.id}`
      }
    })

    // Update order with MercadoPago preference ID
    await prisma.order.update({
      where: { id: order.id },
      data: { mercadopagoId: preference.id }
    })

    return NextResponse.json({
      order_id: order.id,
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    })

  } catch (error) {
    console.error('Error creating payment preference:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}