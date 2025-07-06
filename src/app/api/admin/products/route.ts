import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const skip = (page - 1) * limit

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          variants: {
            orderBy: { units: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: products.map(product => ({
        ...product,
        price: Number(product.price),
        variants: product.variants.map(variant => ({
          ...variant,
          price: Number(variant.price),
          availableStock: Math.floor(product.stock / variant.units)
        })),
        totalVariants: product.variants.length,
        hasActiveVariants: product.variants.some(v => v.active),
      })),
      totalPages,
      currentPage: page,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    })

  } catch (error) {
    console.error('Error fetching admin products:', error)
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
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      price,
      stock,
      categoryId,
      images,
      active,
      featured,
      allowIndividualSale,
      variants,
    } = body

    // Validate required fields
    if (!name || !description || !price || !stock || !categoryId) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      )
    }

    // Validate variants if provided
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (!variant.name || !variant.units || !variant.price) {
          return NextResponse.json(
            { error: 'Todas las variantes deben tener nombre, unidades y precio' },
            { status: 400 }
          )
        }
        if (variant.units <= 0 || variant.price <= 0) {
          return NextResponse.json(
            { error: 'Las unidades y precios de las variantes deben ser positivos' },
            { status: 400 }
          )
        }
      }
      
      // Si no se permite venta individual, debe haber al menos una variante activa
      if (!allowIndividualSale && !variants.some(v => v.active !== false)) {
        return NextResponse.json(
          { error: 'Si no se permite venta individual, debe haber al menos una variante activa' },
          { status: 400 }
        )
      }
    } else if (!allowIndividualSale) {
      // Si no se permite venta individual y no hay variantes, es un error
      return NextResponse.json(
        { error: 'Si no se permite venta individual, debe proporcionar al menos una variante' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este nombre (slug duplicado)' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'La categoría seleccionada no existe' },
        { status: 400 }
      )
    }

    // Create the product with variants in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          price,
          stock,
          categoryId,
          images: images || [],
          active: active ?? true,
          featured: featured ?? false,
          allowIndividualSale: allowIndividualSale ?? true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      // Create variants if provided
      const createdVariants = []
      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              name: variant.name,
              units: variant.units,
              price: variant.price,
              active: variant.active ?? true,
              isDefault: variant.isDefault ?? false,
            }
          })
          createdVariants.push(createdVariant)
        }
      }

      return { product, variants: createdVariants }
    })

    return NextResponse.json({
      message: 'Producto creado exitosamente',
      product: {
        ...result.product,
        price: Number(result.product.price),
        variants: result.variants.map(variant => ({
          ...variant,
          price: Number(variant.price),
        })),
      },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este nombre o slug' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}