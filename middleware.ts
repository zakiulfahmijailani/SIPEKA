import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ---------------------------------------------------------------------------
// Role-based route access map
// More specific paths must come first (sorted by length in getRequiredRoles)
// ---------------------------------------------------------------------------
const ROLE_ACCESS: Record<string, string[]> = {
  "/master/users":  ["SUPER_ADMIN"],
  "/audit":         ["SUPER_ADMIN", "KAPRODI"],
  "/import":        ["SUPER_ADMIN", "KAPRODI"],
  "/master":        ["SUPER_ADMIN", "KAPRODI", "DOSEN"],
  "/kurikulum":     ["SUPER_ADMIN", "KAPRODI", "DOSEN"],
  "/rps":           ["SUPER_ADMIN", "KAPRODI", "DOSEN"],
  "/nilai":         ["SUPER_ADMIN", "KAPRODI", "DOSEN"],
  "/dashboard":     ["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"],
  "/laporan":       ["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"],
  "/referensi":     ["SUPER_ADMIN", "KAPRODI", "DOSEN", "VIEWER"],
}

function getRequiredRoles(pathname: string): string[] | null {
  const sortedPaths = Object.keys(ROLE_ACCESS).sort((a, b) => b.length - a.length)
  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) return ROLE_ACCESS[path]
  }
  return null
}

// ---------------------------------------------------------------------------
// Middleware — wrapping with auth() gives us req.auth (the session)
// ---------------------------------------------------------------------------
export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session

  // Auth page: redirect logged-in users away from /login
  if (pathname.startsWith("/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return NextResponse.next()
  }

  // All other pages: require login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  const userRole = session.user?.role
  const requiredRoles = getRequiredRoles(pathname)

  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    const url = new URL("/dashboard", req.nextUrl)
    url.searchParams.set("error", "unauthorized")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

// ---------------------------------------------------------------------------
// Matcher: exclude static files, _next internals, and API auth routes
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - api/auth      (NextAuth internal routes)
     * - files with an extension (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js)$).*)",
  ],
}
