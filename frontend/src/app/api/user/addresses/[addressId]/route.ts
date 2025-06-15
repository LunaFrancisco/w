import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAddressSchema = z.object({
  name: z.string().min(2).max(50),
  street: z.string().min(5).max(200),
  commune: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  region: z.string().min(2).max(100),
  zipCode: z.string().min(4).max(10),
  phone: z.string().min(8).regex(/^[+\d\s()-]+$/),
  isDefault: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
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
    const result = updateAddressSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { name, street, commune, city, region, zipCode, phone, isDefault } = result.data

    // Check if the address exists and belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.addressId,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // If this is being set as default, update existing default addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true,
          id: { not: params.addressId }
        },
        data: { isDefault: false },
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id: params.addressId },
      data: {
        name,
        street,
        commune,
        city,
        region,
        zipCode,
        phone,
        isDefault,
      },
    })

    return NextResponse.json(updatedAddress, { status: 200 })

  } catch (error) {
    console.error('Error updating address:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Check if the address exists and belongs to the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.addressId,
        userId: session.user.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // Don't allow deleting the default address if it's the only one
    if (existingAddress.isDefault) {
      const addressCount = await prisma.address.count({
        where: { userId: session.user.id }
      })

      if (addressCount === 1) {
        return NextResponse.json(
          { error: 'No puedes eliminar tu única dirección. Agrega otra dirección primero.' },
          { status: 400 }
        )
      }

      // If deleting default address and there are others, set another as default
      const otherAddress = await prisma.address.findFirst({
        where: {
          userId: session.user.id,
          id: { not: params.addressId }
        },
        orderBy: { createdAt: 'asc' }
      })

      if (otherAddress) {
        await prisma.address.update({
          where: { id: otherAddress.id },
          data: { isDefault: true }
        })
      }
    }

    await prisma.address.delete({
      where: { id: params.addressId },
    })

    return NextResponse.json(
      { success: true, message: 'Dirección eliminada exitosamente' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting address:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}