import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "demand_type", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const demandType = await prisma.demandType.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "demand_type", "read", demandType)
  if (denied) return denied

  return NextResponse.json(demandType)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "demand_type", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.demandType.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "demand_type", "update", existing)
  if (denied) return denied

  const body = await request.json()
  const demandType = await prisma.demandType.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(demandType)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "demand_type", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.demandType.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "demand_type", "delete", existing)
  if (denied) return denied

  await prisma.demandType.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Demand type deleted" })
}
