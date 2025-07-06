import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } },
            productVariant: { select: { name: true, units: true } }
          }
        }
      }
    })

    // TODO: Send email notification to customer
    // This would be implemented when we add email notifications

    return NextResponse.json({
      message: 'Estado del pedido actualizado correctamente',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          address: true,
          items: {
            include: {
              product: { select: { name: true, images: true } },
              productVariant: { select: { name: true, units: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // Calculate stats
    const allOrders = await prisma.order.findMany({
      select: { status: true, total: true }
    })

    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === 'PENDING').length,
      paid: allOrders.filter(o => o.status === 'PAID').length,
      preparing: allOrders.filter(o => o.status === 'PREPARING').length,
      shipped: allOrders.filter(o => o.status === 'SHIPPED').length,
      delivered: allOrders.filter(o => o.status === 'DELIVERED').length,
      cancelled: allOrders.filter(o => o.status === 'CANCELLED').length,
      totalRevenue: allOrders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, order) => sum + Number(order.total), 0)
    }

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
          totalUnits: item.quantity * item.productVariant.units
        } : {
          name: 'Unidad Individual',
          units: 1,
          totalUnits: item.quantity
        }
      }))
    }))

    return NextResponse.json({
      orders: formattedOrders,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}