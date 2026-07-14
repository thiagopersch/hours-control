import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "tag", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const tag = await prisma.tag.findFirst({
    where: { id, organizationId },
  })

  const denied = assertRecordAccess(session, "tag", "read", tag)
  if (denied) return denied

  return NextResponse.json(tag)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "tag", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.tag.findFirst({
    where: { id, organizationId },
  })

  const denied = assertRecordAccess(session, "tag", "update", existing)
  if (denied) return denied

  const body = await request.json()
  const tag = await prisma.tag.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(tag)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "tag", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.tag.findFirst({
    where: { id, organizationId },
  })

  const denied = assertRecordAccess(session, "tag", "delete", existing)
  if (denied) return denied

  await prisma.tag.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Tag deleted" })
}
