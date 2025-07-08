import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          orderBy: { units: 'asc' }
        }
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      variants: product.variants.map(variant => ({
        ...variant,
        price: Number(variant.price),
        availableStock: Math.floor(product.stock / variant.units)
      })),
    })
  } catch (error) {
    console.error('Error fetching admin product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

    // Update the product and variants in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the product
      const product = await tx.product.update({
        where: { slug: paramSlug },
        data: {
          name,
          slug,
          description,
          price,
          stock,
          category: {
            connect: {
              id: categoryId
            }
          },
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

      // Handle variants update if provided
      let updatedVariants = []
      if (variants && Array.isArray(variants)) {
        // Delete existing variants that are not in the new list
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: product.id }
        })

        const variantIdsToKeep = variants
          .filter(v => v.id)
          .map(v => v.id)

        const variantsToDelete = existingVariants.filter(
          existing => !variantIdsToKeep.includes(existing.id)
        )

        for (const variantToDelete of variantsToDelete) {
          await tx.productVariant.delete({
            where: { id: variantToDelete.id }
          })
        }

        // Update existing variants or create new ones
        for (const variant of variants) {
          if (variant.id) {
            // Update existing variant
            const updated = await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                units: variant.units,
                price: variant.price,
                active: variant.active ?? true,
                isDefault: variant.isDefault ?? false,
              }
            })
            updatedVariants.push(updated)
          } else {
            // Create new variant
            const created = await tx.productVariant.create({
              data: {
                productId: product.id,
                name: variant.name,
                units: variant.units,
                price: variant.price,
                active: variant.active ?? true,
                isDefault: variant.isDefault ?? false,
              }
            })
            updatedVariants.push(created)
          }
        }
      }

      return { product, variants: updatedVariants }
    })

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
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

export async function PATCH(
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
    const body = await request.json()
    const { active } = body

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

    // Update only the active status
    const updatedProduct = await prisma.product.update({
      where: { slug },
      data: { active },
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
      message: `Producto ${active ? 'activado' : 'desactivado'} exitosamente`,
      product: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
      },
    })
  } catch (error) {
    console.error('Error updating product status:', error)
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