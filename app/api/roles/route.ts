import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "role", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { organizationId, ...scopeWhere }
  if (search) where.name = { contains: search, mode: "insensitive" }

  const roles = await prisma.role.findMany({
    where,
    include: {
      rolePermissions: {
        include: { permission: true },
      },
      _count: { select: { userRoles: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(roles)
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "role", "create")
  if (isGuardFailure(guard)) return guard
  const { organizationId } = guard

  const body = await request.json()
  const { permissionScopes, ...roleData } = body
  const grants = (permissionScopes ?? []).filter(
    (p: { permissionId: string; scope: string }) => p.scope && p.scope !== "NONE"
  )

  const role = await prisma.role.create({
    data: {
      ...roleData,
      organizationId,
      rolePermissions: grants.length
        ? {
            create: grants.map((p: { permissionId: string; scope: string }) => ({
              permission: { connect: { id: p.permissionId } },
              scope: p.scope,
            })),
          }
        : undefined,
    },
    include: {
      rolePermissions: {
        include: { permission: true },
      },
    },
  })

  return NextResponse.json(role, { status: 201 })
}
