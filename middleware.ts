import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ---------------------------------------------------------------------------
// Auth middleware DISABLED — all routes are publicly accessible
// To re-enable login protection, restore the original middleware.ts
// ---------------------------------------------------------------------------
export default function middleware(_req: NextRequest) {
  return NextResponse.next()
}

// ---------------------------------------------------------------------------
// Matcher: exclude static files, _next internals, and API auth routes
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\.ico|api/auth|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js)$).*)",
  ],
}
