import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Cache headers - menos cache para productos que cambian más
    const headers = {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
    }
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'name'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Build where clause
    const where: any = {
      active: true,
    }

    // Search filter
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

    // Category filter
    if (category) {
      where.category = {
        slug: category
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (sort) {
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'name_desc':
        orderBy = { name: 'desc' }
        break
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'created_desc':
        orderBy = { createdAt: 'desc' }
        break
      case 'featured':
        orderBy = [{ featured: 'desc' }, { name: 'asc' }]
        break
      default:
        orderBy = { name: 'asc' }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute queries - Solo cargar variantes si es necesario
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          stock: true,
          images: true,
          featured: true,
          allowIndividualSale: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          variants: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              units: true,
              price: true,
              isDefault: true
            },
            orderBy: { units: 'asc' }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: products.map(product => {
        // Calculate price range including base price and variants
        const allPrices = [
          Number(product.price), // Base price for individual sale
          ...product.variants.map(v => Number(v.price))
        ]
        const minPrice = Math.min(...allPrices)
        const maxPrice = Math.max(...allPrices)
        
        return {
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
          images: Array.isArray(product.images) 
            ? product.images.filter((img): img is string => typeof img === 'string')
            : [],
        }
      }),
      totalPages,
      currentPage: page,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }, { headers })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}