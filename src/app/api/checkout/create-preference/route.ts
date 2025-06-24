import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// TODO: Uncomment when MercadoPago API keys are available

import { 
  createPaymentPreference, 
  formatCartItemsForMP, 
  formatPayerInfo, 
} from '@/lib/mercadopago'


interface CartItem {
  id: string
  productId: string
  name: string
  price: string | number // Can be string from localStorage
  quantity: number
  image?: string
  slug: string
  stock: number
}

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
    const { items, addressId, shippingCost }: { 
      items: CartItem[], 
      addressId: string, 
      shippingCost: number 
    } = body

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
    console.log('=== CHECKOUT DEBUG ===')
    console.log('Received items:', JSON.stringify(items, null, 2))
    console.log('Number of items:', items.length)
    
    for (const item of items) {
      console.log(`\n--- Validating item: ${item.name} ---`)
      console.log(`Looking for product with ID: "${item.productId}"`)
      console.log(`ID type: ${typeof item.productId}`)
      console.log(`ID length: ${item.productId.length}`)
      
      // First, let's check if there are any products in the database
      const allProducts = await prisma.product.findMany({
        select: { id: true, name: true, active: true },
        take: 5
      })
      console.log('Sample products in DB:', allProducts)
      
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      console.log('Query result:', product ? `Found: ${product.name}` : 'NULL - Product not found')

      if (!product) {
        console.error(`❌ Product not found with ID: "${item.productId}"`)
        console.log('Trying to find by name as fallback...')
        
        const productByName = await prisma.product.findFirst({
          where: { name: item.name }
        })
        
        if (productByName) {
          console.log(`✅ Found product by name: ${productByName.name} with ID: ${productByName.id}`)
        } else {
          console.log('❌ Product not found by name either')
        }
        
        return NextResponse.json(
          { error: `Producto ${item.name} no encontrado` },
          { status: 404 }
        )
      }

      console.log(`✅ Product found: ${product.name}, Stock: ${product.stock}`)

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}` },
          { status: 400 }
        )
      }
    }
    
    console.log('=== END CHECKOUT DEBUG ===\n')

    // Calculate totals
    const subtotal = items.reduce((total: number, item: CartItem) => {
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
      return total + (itemPrice * item.quantity)
    }, 0)
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
      items.map((item: CartItem) => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
        return prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: itemPrice,
            total: itemPrice * item.quantity
          }
        })
      })
    )

    // TODO: Uncomment when MercadoPago API keys are available
    
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

    console.log('MercadoPago preference created:', {
      orderId: order.id,
      preferenceId: preference.id,
      initPoint: preference.init_point
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