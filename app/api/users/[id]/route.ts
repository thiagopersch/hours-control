import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { hash } from "@node-rs/argon2"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nameSchema, emailSchema, phoneSchema, passwordSchema } from "@/lib/validators"

const userUpdateSchema = z.object({
  name: nameSchema(),
  email: emailSchema(true),
  phone: phoneSchema(false),
  password: passwordSchema(false),
  status: z.enum(["active", "inactive"]),
  mustChangePassword: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
})

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
      mustChangePassword: true,
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
  const parsed = userUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { password, roleIds, ...userData } = parsed.data

  if (userData.email !== existing.email) {
    const emailInUse = await prisma.user.findUnique({ where: { email: userData.email } })
    if (emailInUse) return NextResponse.json({ error: "Email já está em uso" }, { status: 409 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...userData,
      ...(password ? { passwordHash: await hash(password) } : {}),
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
      mustChangePassword: true,
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
