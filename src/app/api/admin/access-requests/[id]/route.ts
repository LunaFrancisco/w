import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID de solicitud requerido' },
        { status: 400 }
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

    const accessRequest = await prisma.accessRequest.findUnique({
      where: { id },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            image: true,
            createdAt: true,
            role: true
          } 
        },
        processor: { 
          select: { 
            name: true, 
            email: true 
          } 
        }
      }
    })

    if (!accessRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      request: accessRequest
    })

  } catch (error) {
    console.error('Error fetching access request:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}