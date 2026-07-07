import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const userId = session.user.id
  const { searchParams } = request.nextUrl
  const unreadOnly = searchParams.get("unreadOnly") === "true"
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "50", 10)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { userId }
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
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

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
