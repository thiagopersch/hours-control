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
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { organizationId, deletedAt: null }
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      userRoles: {
        include: {
          role: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const body = await request.json()

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  })
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash: body.passwordHash,
      phone: body.phone,
      status: body.status ?? "active",
      organizationId,
      userRoles: body.roleIds?.length
        ? {
            create: body.roleIds.map((roleId: string) => ({
              role: { connect: { id: roleId } },
            })),
          }
        : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      status: true,
      createdAt: true,
      userRoles: {
        include: {
          role: { select: { id: true, name: true } },
        },
      },
    },
  })

  return NextResponse.json(user, { status: 201 })
}
