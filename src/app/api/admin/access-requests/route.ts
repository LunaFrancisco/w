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
    const { requestId, status, adminNotes, updateNotesOnly } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'ID de solicitud requerido' },
        { status: 400 }
      )
    }

    // If updating notes only, we don't need to validate status change
    if (!updateNotesOnly) {
      if (!status) {
        return NextResponse.json(
          { error: 'Status requerido para procesar solicitud' },
          { status: 400 }
        )
      }

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json(
          { error: 'Status inválido' },
          { status: 400 }
        )
      }
    }

    // Prepare update data based on operation type
    const updateData: any = {
      adminNotes: adminNotes || null,
    }

    // If not just updating notes, also update status and processing info
    if (!updateNotesOnly) {
      updateData.status = status
      updateData.processedAt = new Date()
      updateData.processedBy = session.user.id
    }

    // Update the access request
    const updatedRequest = await prisma.accessRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        user: true
      }
    })

    // If approved, update user role to CLIENT (only for status changes)
    if (!updateNotesOnly && status === 'APPROVED') {
      await prisma.user.update({
        where: { id: updatedRequest.userId },
        data: { role: 'CLIENT' }
      })
    }

    const message = updateNotesOnly 
      ? 'Notas actualizadas correctamente'
      : `Solicitud ${status === 'APPROVED' ? 'aprobada' : 'rechazada'} correctamente`

    return NextResponse.json({
      message,
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