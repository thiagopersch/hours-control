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
  const role = await prisma.role.findFirst({
    where: { id, organizationId },
    include: {
      rolePermissions: {
        include: { permission: true },
      },
      _count: { select: { userRoles: true } },
    },
  })

  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 })

  return NextResponse.json(role)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.role.findFirst({
    where: { id, organizationId },
  })

  if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 })

  const body = await request.json()
  const { permissionIds, ...roleData } = body

  const role = await prisma.role.update({
    where: { id },
    data: {
      ...roleData,
      ...(permissionIds
        ? {
            rolePermissions: {
              deleteMany: {},
              create: permissionIds.map((permissionId: string) => ({
                permission: { connect: { id: permissionId } },
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
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.role.findFirst({
    where: { id, organizationId },
  })

  if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 })

  if (existing.isSystem) {
    return NextResponse.json({ error: "Cannot delete system role" }, { status: 400 })
  }

  await prisma.role.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Role deleted" })
}
