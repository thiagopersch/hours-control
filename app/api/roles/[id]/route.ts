import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "role", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const role = await prisma.role.findFirst({
    where: { id, organizationId },
    include: {
      rolePermissions: {
        include: { permission: true },
      },
      _count: { select: { userRoles: true } },
    },
  })

  const denied = assertRecordAccess(session, "role", "read", role)
  if (denied) return denied

  return NextResponse.json(role)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "role", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.role.findFirst({
    where: { id, organizationId },
  })

  const denied = assertRecordAccess(session, "role", "update", existing)
  if (denied) return denied

  const body = await request.json()
  const { permissionScopes, ...roleData } = body
  const grants = permissionScopes
    ? (permissionScopes as { permissionId: string; scope: string }[]).filter(
        (p) => p.scope && p.scope !== "NONE"
      )
    : undefined

  const role = await prisma.role.update({
    where: { id },
    data: {
      ...roleData,
      ...(grants
        ? {
            rolePermissions: {
              deleteMany: {},
              create: grants.map((p) => ({
                permission: { connect: { id: p.permissionId } },
                scope: p.scope,
              })),
            },
          }
        : {}),
    },
    include: {
      rolePermissions: {
        include: { permission: true },
      },
    },
  })

  return NextResponse.json(role)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "role", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.role.findFirst({
    where: { id, organizationId },
    include: { _count: { select: { userRoles: true } } },
  })

  const denied = assertRecordAccess(session, "role", "delete", existing)
  if (denied) return denied
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  if (existing._count.userRoles > 0) {
    return NextResponse.json(
      { error: "Existem usuários vinculados a este perfil" },
      { status: 409 }
    )
  }

  await prisma.role.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Role deleted" })
}
