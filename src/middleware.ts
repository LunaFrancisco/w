import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
import { edgeAuth } from '@/lib/auth.edge'

export default edgeAuth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes that don't require authentication
  const publicRoutes = [
    '/contacto',
    '/solicitud-acceso',
    '/auth/signin',
    '/auth/error',
    '/not-found',
    '/500',
    '/politica-privacidad',
    '/terminos-condiciones',
    '/politica-cookies'
  ]

  // API routes that don't require authentication
  const publicApiRoutes = [
    '/api/contact',
    '/api/access-request',
    '/api/auth'
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

  // Allow public routes and API routes
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Redirect to signin if not authenticated
  if (!session) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  const userRole = session.user?.role
  // Handle role-based access control
  if (pathname.startsWith('/(portal)') || pathname.startsWith('/dashboard') || pathname.startsWith('/productos') || pathname.startsWith('/carrito') || pathname.startsWith('/pedidos') || pathname.startsWith('/perfil') || pathname.startsWith('/checkout')) {
    // Portal routes require CLIENT or ADMIN role
    if (userRole === 'PENDING') {
      return NextResponse.redirect(new URL('/auth/pending', req.url))
    }
    if (userRole !== 'CLIENT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    // Admin routes require ADMIN role
    if (userRole !== 'ADMIN') {
      const unauthorizedUrl = new URL('/auth/unauthorized', req.url)
      // Let them know they tried to access admin area
      unauthorizedUrl.searchParams.set('reason', 'admin')
      return NextResponse.redirect(unauthorizedUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}