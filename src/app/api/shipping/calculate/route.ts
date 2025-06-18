import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commune = searchParams.get('commune')

    if (!commune) {
      return NextResponse.json(
        { error: 'Comuna es requerida' },
        { status: 400 }
      )
    }

    // Find shipping zone by commune
    const shippingZone = await prisma.shippingZone.findFirst({
      where: {
        commune: {
          equals: commune,
          mode: 'insensitive'
        },
        active: true
      }
    })

    if (!shippingZone) {
      // Default shipping cost if commune not found
      return NextResponse.json({
        cost: 5000,
        deliveryDays: 3,
        commune: commune,
        message: 'Costo de envío estándar aplicado'
      })
    }

    return NextResponse.json({
      cost: Number(shippingZone.cost),
      deliveryDays: shippingZone.deliveryDays,
      commune: shippingZone.commune
    })

  } catch (error) {
    console.error('Error calculating shipping:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}