import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "notification", "read")
  if (isGuardFailure(guard)) return guard
  const { session } = guard

  const { id } = await params
  const notification = await prisma.notification.findFirst({
    where: { id, user: { organizationId: session.user.organizationId } },
  })

  const denied = assertRecordAccess(session, "notification", "read", notification)
  if (denied) return denied

  return NextResponse.json(notification)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "notification", "update")
  if (isGuardFailure(guard)) return guard
  const { session } = guard

  const { id } = await params
  const existing = await prisma.notification.findFirst({
    where: { id, user: { organizationId: session.user.organizationId } },
  })

  const denied = assertRecordAccess(session, "notification", "update", existing)
  if (denied) return denied

  const notification = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  })

  return NextResponse.json(notification)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "notification", "delete")
  if (isGuardFailure(guard)) return guard
  const { session } = guard

  const { id } = await params
  const existing = await prisma.notification.findFirst({
    where: { id, user: { organizationId: session.user.organizationId } },
  })

  const denied = assertRecordAccess(session, "notification", "delete", existing)
  if (denied) return denied

  await prisma.notification.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Notification deleted" })
}
