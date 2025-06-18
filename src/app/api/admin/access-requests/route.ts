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
    const { requestId, status, adminNotes } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Update the access request
    const updatedRequest = await prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes: adminNotes || null,
        processedAt: new Date(),
        processedBy: session.user.id
      },
      include: {
        user: true
      }
    })

    // If approved, update user role to CLIENT
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: updatedRequest.userId },
        data: { role: 'CLIENT' }
      })
    }

    return NextResponse.json({
      message: 'Solicitud procesada correctamente',
      request: updatedRequest
    })

  } catch (error) {
    console.error('Error processing access request:', error)
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    // Execute with retry logic and timeout
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
    console.log('Fetching access requests...')
    const accessRequests = await executeWithRetry(() => prisma.accessRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        processor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }))
    
    console.log('Counting access requests...')
    const total = await executeWithRetry(() => prisma.accessRequest.count({ where }))

    return NextResponse.json({
      requests: accessRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching access requests:', error)
    
    // Return fallback data if database is not available
    return NextResponse.json({
      requests: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },
      error: 'Los datos no están disponibles temporalmente. Intenta actualizar en unos momentos.',
      fallback: true
    })
  }
}