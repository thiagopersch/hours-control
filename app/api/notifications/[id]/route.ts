import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const notification = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 })

  return NextResponse.json(notification)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) return NextResponse.json({ error: "Notification not found" }, { status: 404 })

  const notification = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  })

  return NextResponse.json(notification)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) return NextResponse.json({ error: "Notification not found" }, { status: 404 })

  await prisma.notification.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Notification deleted" })
}
