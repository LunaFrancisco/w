import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'CLIENT', 'PENDING']).default('PENDING'),
  image: z.string().url().optional(),
  address: z.object({
    name: z.string().min(2),
    street: z.string().min(5),
    commune: z.string().min(2),
    city: z.string().min(2),
    region: z.string().min(2),
    zipCode: z.string().min(3),
    phone: z.string().min(8)
  }).optional(),
  adminNotes: z.string().optional()
})

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
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const validRoles = ['ADMIN', 'CLIENT', 'PENDING']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    // Prevent changing own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes cambiar tu propio rol' },
        { status: 400 }
      )
    }

    // Update the user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Rol del usuario actualizado correctamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = createUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { name, email, role, image, address, adminNotes } = validationResult.data

    // Verificar que el email no existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 409 }
      )
    }

    // Crear usuario con transacción
    const newUser = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          name,
          email,
          role,
          image: image || null,
          emailVerified: new Date() // Auto-verificar usuarios creados por admin
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true
        }
      })

      // Crear dirección si se proporcionó
      if (address) {
        await tx.address.create({
          data: {
            userId: user.id,
            ...address,
            isDefault: true
          }
        })
      }

      // Log de actividad administrativa (si tienes una tabla de logs)
      // await tx.adminLog.create({
      //   data: {
      //     adminId: session.user.id,
      //     action: 'CREATE_USER',
      //     targetUserId: user.id,
      //     notes: adminNotes
      //   }
      // })

      return user
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
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

    const { searchParams } = new URL(request.url)
    
    // Filtros avanzados
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const emailVerified = searchParams.get('emailVerified')
    const hasOrders = searchParams.get('hasOrders')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // Max 100
    const skip = (page - 1) * limit

    // Construir filtros WHERE
    const where: any = {}

    // Búsqueda por nombre o email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtro por rol
    if (role && role !== 'all') {
      where.role = role
    }

    // Filtro por verificación de email
    if (emailVerified === 'true') {
      where.emailVerified = { not: null }
    } else if (emailVerified === 'false') {
      where.emailVerified = null
    }

    // Filtro por actividad (usuarios con pedidos)
    if (hasOrders === 'true') {
      where.orders = { some: {} }
    } else if (hasOrders === 'false') {
      where.orders = { none: {} }
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Construir ordenamiento
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder
    } else if (sortBy === 'role') {
      orderBy.role = sortOrder
    } else if (sortBy === 'ordersCount') {
      orderBy.orders = { _count: sortOrder }
    } else {
      orderBy[sortBy] = sortOrder
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
              provider: true
            }
          },
          accessRequest: {
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              orders: true,
              addresses: true,
              processedRequests: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Calculate stats (optimized - only fetch counts)
    const [
      totalCount,
      adminCount,
      clientCount,
      pendingCount,
      verifiedCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'PENDING' } }),
      prisma.user.count({ where: { emailVerified: { not: null } } })
    ])

    const stats = {
      total: totalCount,
      admins: adminCount,
      clients: clientCount,
      pending: pendingCount,
      verified: verifiedCount,
      filtered: total
    }

    return NextResponse.json({
      users,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        search,
        role,
        emailVerified,
        hasOrders,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}