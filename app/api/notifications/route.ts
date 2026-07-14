import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "notification", "read")
  if (isGuardFailure(guard)) return guard
  const { session, scopeWhere } = guard

  const userId = session.user.id
  const { searchParams } = request.nextUrl
  const unreadOnly = searchParams.get("unreadOnly") === "true"
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "50", 10)
  const skip = (page - 1) * limit

  // Notifications have no organizationId column - org isolation is via the
  // owning user's organization, enforced through this relation filter.
  const where: Record<string, unknown> = {
    user: { organizationId: session.user.organizationId },
    ...scopeWhere,
  }
  if (unreadOnly) where.readAt = null

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ])

  return NextResponse.json({
    data: notifications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    unreadCount: await prisma.notification.count({
      where: { userId, readAt: null },
    }),
  })
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "notification", "create")
  if (isGuardFailure(guard)) return guard
  const { session } = guard

  const body = await request.json()

  const notification = await prisma.notification.create({
    data: {
      type: body.type,
      title: body.title,
      body: body.body,
      data: body.data ?? undefined,
      userId: body.userId ?? session.user.id,
    },
  })

  return NextResponse.json(notification, { status: 201 })
}
