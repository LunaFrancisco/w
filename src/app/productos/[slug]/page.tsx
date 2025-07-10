import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProductDetailContent } from '@/components/ecommerce/ProductDetailContent'

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

async function getProduct(slug: string) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
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
          where: {
            active: true,
          },
          orderBy: [
            { isDefault: 'desc' },
            { units: 'asc' },
          ],
        },
      },
    })

    if (!product) {
      return null
    }

    return {
      ...product,
      price: Number(product.price),
      images: Array.isArray(product.images) 
        ? product.images.filter((img): img is string => typeof img === 'string')
        : [],
      variants: product.variants.map(variant => ({
        ...variant,
        price: Number(variant.price),
      })),
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const session = await auth()
  
  if (!session || session.user.role === 'PENDING') {
    redirect('/auth/signin')
  }

  const { slug } = await params
  const product = await getProduct(slug)
  
  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ProductDetailContent product={product} />
        </Suspense>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  
  if (!product) {
    return {
      title: 'Producto no encontrado',
    }
  }

  return {
    title: `${product.name} - ClubW`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.length > 0 ? [product.images[0]] : [],
    },
  }
}