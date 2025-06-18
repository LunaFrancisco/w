import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAddressSchema = z.object({
  name: z.string().min(2).max(50),
  street: z.string().min(5).max(200),
  commune: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  region: z.string().min(2).max(100),
  zipCode: z.string().min(4).max(10),
  phone: z.string().min(8).regex(/^[+\d\s()-]+$/),
  isDefault: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' }, // Default address first
        { createdAt: 'asc' }
      ],
    })

    return NextResponse.json(addresses, { status: 200 })

  } catch (error) {
    console.error('Error fetching addresses:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
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
    
    // Validate the request body
    const result = createAddressSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { name, street, commune, city, region, zipCode, phone, isDefault } = result.data

    // If this is being set as default, update existing default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true 
        },
        data: { isDefault: false },
      })
    }

    // Check if this is the user's first address - if so, make it default
    const existingAddressCount = await prisma.address.count({
      where: { userId: session.user.id }
    })

    const shouldBeDefault = isDefault || existingAddressCount === 0

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        name,
        street,
        commune,
        city,
        region,
        zipCode,
        phone,
        isDefault: shouldBeDefault,
      },
    })

    return NextResponse.json(address, { status: 201 })

  } catch (error) {
    console.error('Error creating address:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}