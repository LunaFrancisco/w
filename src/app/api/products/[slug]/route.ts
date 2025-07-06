import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role === 'PENDING') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { slug } = await params
    const product = await prisma.product.findUnique({
      where: {
        slug,
        active: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { active: true },
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

    // Calculate price range and stock information
    const allPrices = [
      Number(product.price), // Base price for individual sale
      ...product.variants.map(v => Number(v.price))
    ]
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)

    return NextResponse.json({
      ...product,
      price: Number(product.price), // Base price for individual
      priceRange: {
        min: minPrice,
        max: maxPrice,
        hasVariants: product.variants.length > 0
      },
      variants: product.variants.map(variant => ({
        ...variant,
        price: Number(variant.price),
        availableStock: Math.floor(product.stock / variant.units)
      })),
      individualStock: product.stock, // Stock available for individual purchase
      images: Array.isArray(product.images) 
        ? product.images.filter((img): img is string => typeof img === 'string')
        : [],
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}