import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Public routes that don't require authentication
  const isPublicRoute = nextUrl.pathname.startsWith("/api/auth") ||
                       nextUrl.pathname === "/" ||
                       nextUrl.pathname.startsWith("/contacto") ||
                       nextUrl.pathname.startsWith("/solicitud-acceso") ||
                       nextUrl.pathname.startsWith("/_next") ||
                       nextUrl.pathname.startsWith("/favicon")

  // Auth routes
  const isAuthRoute = nextUrl.pathname.startsWith("/auth/")

  // Protected routes
  const isPortalRoute = nextUrl.pathname.startsWith("/portal")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")

  // If not logged in and trying to access protected routes
  if (!isLoggedIn && (isPortalRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl))
  }

  // If logged in and trying to access auth routes, redirect to appropriate dashboard
  if (isLoggedIn && isAuthRoute) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
    } else if (userRole === "CLIENT") {
      return NextResponse.redirect(new URL("/portal/dashboard", nextUrl))
    } else {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Role-based route protection
  if (isLoggedIn) {
    // Admin routes - only ADMIN can access
    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }

    // Portal routes - only CLIENT can access
    if (isPortalRoute && userRole !== "CLIENT") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}