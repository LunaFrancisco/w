import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        id: params.id,
        active: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}