import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "client", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const client = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "client", "read", client)
  if (denied) return denied

  return NextResponse.json(client)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "client", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "client", "update", existing)
  if (denied) return denied

  const body = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(client)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "client", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "client", "delete", existing)
  if (denied) return denied

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Client deleted" })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "client", "favorite")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "client", "favorite", existing)
  if (denied) return denied

  const body = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data: { favorite: body.favorite },
  })

  return NextResponse.json(client)
}
