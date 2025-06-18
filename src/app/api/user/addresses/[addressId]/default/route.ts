import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // If already default, no need to change
    if (existingAddress.isDefault) {
      return NextResponse.json(existingAddress, { status: 200 })
    }

    // First, remove default from all other addresses
    await prisma.address.updateMany({
      where: { 
        userId: session.user.id,
        isDefault: true 
      },
      data: { isDefault: false },
    })

    // Then set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id: params.addressId },
      data: { isDefault: true },
    })

    return NextResponse.json(updatedAddress, { status: 200 })

  } catch (error) {
    console.error('Error setting default address:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}