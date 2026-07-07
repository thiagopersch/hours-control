import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { searchParams } = request.nextUrl
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { organizationId }
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
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const body = await request.json()
  const { permissionIds, ...roleData } = body

  const role = await prisma.role.create({
    data: {
      ...roleData,
      organizationId,
      rolePermissions: permissionIds?.length
        ? {
            create: permissionIds.map((permissionId: string) => ({
              permission: { connect: { id: permissionId } },
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
