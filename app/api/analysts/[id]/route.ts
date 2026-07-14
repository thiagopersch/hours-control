import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "analyst", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const analyst = await prisma.analyst.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "analyst", "read", analyst)
  if (denied) return denied

  return NextResponse.json(analyst)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "analyst", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.analyst.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "analyst", "update", existing)
  if (denied) return denied

  const body = await request.json()
  const analyst = await prisma.analyst.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(analyst)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "analyst", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.analyst.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "analyst", "delete", existing)
  if (denied) return denied

  await prisma.analyst.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Analyst deleted" })
}
