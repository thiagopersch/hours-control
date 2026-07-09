import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { flattenNavItems } from "@/lib/nav-items"
import { hasPermission } from "@/lib/permissions"

const flatNavItems = flattenNavItems()

const publicRoutes = ["/login", "/register", "/forgot-password", "/api/auth"]
const apiRoutes = ["/api/"]

export function proxy(request: NextRequest) {
  return proxyHandler(request)
}

async function proxyHandler(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))
  const isApiRoute = apiRoutes.some((route) => pathname.startsWith(route))

  if (isPublic) {
    logRequest(request)
    return NextResponse.next()
  }

  const session = await auth()

  if (!session?.user?.id) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  logRequest(request, session.user.id)
  const orgId = (session.user as any).organizationId
  const permissions = (session.user as any).permissions as string[] | undefined
  const mustChangePassword = (session.user as any).mustChangePassword as boolean | undefined
  const isSuperAdmin = (session.user as any).isSuperAdmin as boolean | undefined

  if (!isApiRoute) {
    if (mustChangePassword && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url))
    }

    const matchedItem = flatNavItems.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    )
    if (matchedItem?.superAdminOnly && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (matchedItem?.resource && !hasPermission(permissions, matchedItem.resource)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("X-User-Id", session.user.id)
  if (orgId) requestHeaders.set("X-Organization-Id", orgId)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

function logRequest(request: NextRequest, userId?: string) {
  logger.debug(
    {
      method: request.method,
      path: request.nextUrl.pathname,
      userId,
      ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    },
    "Incoming request"
  )
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
