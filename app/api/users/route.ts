import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { hash } from "@node-rs/argon2"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { nameSchema, emailSchema, phoneSchema, passwordSchema } from "@/lib/validators"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

const userCreateSchema = z.object({
  name: nameSchema(),
  email: emailSchema(true),
  phone: phoneSchema(false),
  password: passwordSchema(true),
  status: z.enum(["active", "inactive"]),
  mustChangePassword: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "user", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const filters: Record<string, unknown> = {}
  if (status) filters.status = status
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const where: Record<string, unknown> = {
    organizationId,
    deletedAt: null,
    AND: [scopeWhere, filters],
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
      mustChangePassword: true,
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
  const guard = await requireScope(request, "user", "create")
  if (isGuardFailure(guard)) return guard
  const { organizationId } = guard

  const body = await request.json()
  const parsed = userCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { password, roleIds, ...userData } = parsed.data

  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  })
  if (existingUser) {
    return NextResponse.json({ error: "Email já está em uso" }, { status: 409 })
  }

  try {
    const passwordHash = await hash(password)

    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        organizationId,
        userRoles: roleIds?.length
          ? {
              create: roleIds.map((roleId: string) => ({
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
        mustChangePassword: true,
        createdAt: true,
        userRoles: {
          include: {
            role: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    logger.error({ error }, "Failed to create user")
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
