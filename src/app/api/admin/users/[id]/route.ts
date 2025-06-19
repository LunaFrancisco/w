import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['ADMIN', 'CLIENT', 'PENDING']).optional(),
  image: z.string().url().optional(),
  emailVerified: z.boolean().optional(),
  adminNotes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [session, { id: userId }] = await Promise.all([
      auth(),
      params
    ])

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Obtener información completa del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            type: true
          }
        },
        addresses: {
          select: {
            id: true,
            name: true,
            street: true,
            commune: true,
            city: true,
            region: true,
            zipCode: true,
            phone: true,
            isDefault: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                price: true,
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        accessRequest: {
          select: {
            id: true,
            status: true,
            documents: true,
            adminNotes: true,
            createdAt: true,
            processedAt: true,
            processor: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        processedRequests: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            processedAt: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { processedAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
            processedRequests: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas adicionales
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
      _sum: { total: true }
    })

    const stats = {
      totalOrders: user._count.orders,
      totalSpent: orderStats.reduce((sum, stat) => sum + Number(stat._sum.total || 0), 0),
      ordersByStatus: orderStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>),
      totalAddresses: user._count.addresses,
      processedRequests: user._count.processedRequests,
      lastOrderDate: user.orders[0]?.createdAt || null,
      accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      user,
      stats
    })

  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [session, { id: userId }] = await Promise.all([
      auth(),
      params
    ])

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }
    const body = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Validar datos de entrada
    const validationResult = updateUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Prevenir que el admin se quite su propio rol de admin
    if (userId === session.user.id && updateData.role && updateData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No puedes cambiar tu propio rol de administrador' },
        { status: 400 }
      )
    }

    // Si se está cambiando el email, verificar que no exista
    if (updateData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con ese email' },
          { status: 409 }
        )
      }
    }

    // Preparar datos para actualizar, excluyendo adminNotes y emailVerified
    const { adminNotes, emailVerified, ...baseUpdatePayload } = updateData

    // Preparar el payload final para la actualización
    const finalUpdatePayload = {
      ...baseUpdatePayload,
      ...(emailVerified !== undefined ? {
        emailVerified: emailVerified ? new Date() : null
      } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {})
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...finalUpdatePayload,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        emailVerified: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Usuario actualizado correctamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [session, { id: userId }] = await Promise.all([
      auth(),
      params
    ])

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Prevenir eliminación del propio usuario
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - en lugar de eliminar, cambiar role a DELETED o usar un campo deleted
    // Para este caso, simplemente eliminamos (hard delete) pero podrías implementar soft delete
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({
      message: 'Usuario eliminado correctamente',
      deletedUser
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    
    // Manejar errores de restricción de clave foránea
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'No se puede eliminar el usuario porque tiene pedidos o datos relacionados' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}