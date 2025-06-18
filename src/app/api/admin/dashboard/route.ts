import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos. Intenta nuevamente en unos momentos.' },
        { status: 503 }
      )
    }

    // Execute queries with retry logic and timeout
    const executeWithRetry = async (query: () => Promise<any>, maxRetries = 2) => {
      for (let i = 0; i <= maxRetries; i++) {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 10000)
          )
          return await Promise.race([query(), timeoutPromise])
        } catch (error) {
          if (i === maxRetries) throw error
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }

    // Execute queries sequentially to avoid connection limits
    console.log('Fetching dashboard stats sequentially...')
    
    const totalUsers = await executeWithRetry(() => prisma.user.count())
    const pendingUsers = await executeWithRetry(() => prisma.user.count({ where: { role: 'PENDING' } }))
    const totalProducts = await executeWithRetry(() => prisma.product.count({ where: { active: true } }))
    const lowStockProducts = await executeWithRetry(() => prisma.product.count({ 
      where: { 
        active: true, 
        stock: { lt: 10 } 
      } 
    }))
    const pendingRequests = await executeWithRetry(() => prisma.accessRequest.count({ 
      where: { status: 'PENDING' } 
    }))
    const ordersToday = await executeWithRetry(() => prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }))
    const revenueToday = await executeWithRetry(async () => {
      const result = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          },
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true }
      })
      return result._sum.total || 0
    })
    const recentOrders = await executeWithRetry(() => prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    }))
    const recentRequests = await executeWithRetry(() => prisma.accessRequest.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    }))

    const stats = {
      totalUsers,
      pendingUsers,
      totalProducts,
      lowStockProducts,
      pendingRequests,
      ordersToday,
      revenueToday: Number(revenueToday),
      recentOrders,
      recentRequests
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    
    // Return fallback data if database is not available
    const fallbackStats = {
      totalUsers: 0,
      pendingUsers: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      pendingRequests: 0,
      ordersToday: 0,
      revenueToday: 0,
      recentOrders: [],
      recentRequests: []
    }

    return NextResponse.json({
      ...fallbackStats,
      error: 'Los datos no están disponibles temporalmente. Intenta actualizar en unos momentos.',
      fallback: true
    })
  }
}