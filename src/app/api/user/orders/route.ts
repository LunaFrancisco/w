import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        address: {
          select: {
            name: true,
            street: true,
            commune: true,
            city: true,
            region: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            },
            productVariant: {
              select: {
                id: true,
                name: true,
                units: true,
                active: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit && { take: limit })
    })

    // Format orders to include variant information
    const formattedOrders = orders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
        displayName: item.productVariant 
          ? `${item.product.name} - ${item.productVariant.name}`
          : item.product.name,
        isVariant: item.productVariantId !== null,
        variantInfo: item.productVariant ? {
          name: item.productVariant.name,
          units: item.productVariant.units,
          totalUnits: item.quantity * item.productVariant.units // Total units purchased
        } : {
          name: 'Unidad Individual',
          units: 1,
          totalUnits: item.quantity
        }
      }))
    }))

    return NextResponse.json(formattedOrders)

  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}