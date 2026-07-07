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
  const user = await prisma.user.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      userRoles: {
        include: {
          role: { select: { id: true, name: true, description: true } },
        },
      },
    },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(user)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.user.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await request.json()
  const { roleIds, ...userData } = body

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...userData,
      ...(roleIds
        ? {
            userRoles: {
              deleteMany: {},
              create: roleIds.map((roleId: string) => ({
                role: { connect: { id: roleId } },
              })),
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      status: true,
      updatedAt: true,
      userRoles: {
        include: {
          role: { select: { id: true, name: true } },
        },
      },
    },
  })

  return NextResponse.json(user)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.user.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "User deleted" })
}
