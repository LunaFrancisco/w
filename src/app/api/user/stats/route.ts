import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get user's order statistics
    const [totalOrders, pendingOrders, completedOrders, totalSpentResult] = await Promise.all([
      // Total orders count
      prisma.order.count({
        where: { userId: session.user.id }
      }),
      
      // Pending orders (PENDING, PAID, PREPARING, SHIPPED)
      prisma.order.count({
        where: {
          userId: session.user.id,
          status: {
            in: ['PENDING', 'PAID', 'PREPARING', 'SHIPPED']
          }
        }
      }),
      
      // Completed orders (DELIVERED)
      prisma.order.count({
        where: {
          userId: session.user.id,
          status: 'DELIVERED'
        }
      }),
      
      // Total spent (sum of all delivered/paid orders)
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          status: {
            in: ['DELIVERED', 'PAID', 'PREPARING', 'SHIPPED']
          }
        },
        _sum: {
          total: true
        }
      })
    ])

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSpent: totalSpentResult._sum.total || 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}