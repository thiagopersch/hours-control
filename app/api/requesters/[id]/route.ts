import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "requester", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const requester = await prisma.requester.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "requester", "read", requester)
  if (denied) return denied

  return NextResponse.json(requester)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "requester", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.requester.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "requester", "update", existing)
  if (denied) return denied

  const body = await request.json()
  const requester = await prisma.requester.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(requester)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "requester", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.requester.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "requester", "delete", existing)
  if (denied) return denied

  await prisma.requester.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Requester deleted" })
}
