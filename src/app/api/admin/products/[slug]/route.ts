import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { slug: paramSlug } = await params
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
    } = body

    // Validate required fields
    if (!name || !description || !price || !stock || !categoryId) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: paramSlug }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Check if slug is taken by another product
    if (slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Ya existe un producto con este nombre (slug duplicado)' },
          { status: 400 }
        )
      }
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

    // Update the product
    const product = await prisma.product.update({
      where: { slug: paramSlug },
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

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
      product: {
        ...product,
        price: Number(product.price),
      },
    })
  } catch (error) {
    console.error('Error updating product:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { slug } = await params
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Check if product has orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: existingProduct.id }
    })

    if (orderItems) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene pedidos asociados. Puedes desactivarlo en su lugar.' },
        { status: 400 }
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: { slug }
    })

    return NextResponse.json({
      message: 'Producto eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}