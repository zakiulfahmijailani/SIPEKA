import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Role-based route access configuration
const ROLE_ACCESS: Record<string, string[]> = {
  // Routes accessible by specific roles
  "/master/users": ["SUPER_ADMIN"],
  "/audit": ["SUPER_ADMIN", "KAPRODI"],
  "/import": ["SUPER_ADMIN", "KAPRODI"],

  // Routes accessible by admin + kaprodi + dosen
  "/master": ["SUPER_ADMIN", "KAPRODI", "DOSEN"],
  "/kurikulum": ["SUPER_ADMIN", "KAPRODI", "DOSEN"],
  "/rps": ["SUPER_ADMIN", "KAPRODI", "DOSEN"],
  "/nilai": ["SUPER_ADMIN", "KAPRODI", "DOSEN"],

  // Routes accessible by all authenticated users
  "/dashboard": ["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"],
  "/laporan": ["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"],
  "/referensi": ["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"],
}

function getRequiredRoles(pathname: string): string[] | null {
  // Check most specific path first (longer paths first)
  const sortedPaths = Object.keys(ROLE_ACCESS).sort(
    (a, b) => b.length - a.length
  )
  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) {
      return ROLE_ACCESS[path]
    }
  }
  return null // No specific role requirement found
}

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const { pathname } = nextUrl
  const isLoggedIn = !!session

  // Allow auth API routes
  const isApiAuth = pathname.startsWith("/api/auth")
  if (isApiAuth) return NextResponse.next()

  // Allow static assets
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  if (isPublicAsset) return NextResponse.next()

  // Auth page handling
  const isAuthPage = pathname.startsWith("/login")
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Role-based access control for authenticated users
  if (isLoggedIn && session.user) {
    const userRole = session.user.role
    const requiredRoles = getRequiredRoles(pathname)

    if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
      // User doesn't have the required role → redirect to dashboard with error
      const url = new URL("/dashboard", nextUrl)
      url.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
