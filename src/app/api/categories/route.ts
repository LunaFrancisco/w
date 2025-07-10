import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hideEmpty = searchParams.get('hideEmpty') === 'true'

    // Cache headers
    const headers = {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    }

    const categories = await prisma.category.findMany({
      where: {
        active: true,
        ...(hideEmpty && {
          products: {
            some: {
              active: true
            }
          }
        })
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        showInHome: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories, { headers })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { name, description, image, showInHome } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Generar slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Verificar que el slug no exista
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con este nombre' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image?.trim() || null,
        active: true,
        showInHome: showInHome || false
      }
    })

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}