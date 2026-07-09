import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nameSchema } from "@/lib/validators"

const organizationUpdateSchema = z.object({
  name: nameSchema(),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen"),
  document: z.string().optional().or(z.literal("")),
  plan: z.enum(["free", "pro", "enterprise"]),
  status: z.enum(["active", "inactive"]),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(session.user as any).isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const organization = await prisma.organization.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { users: true } } },
  })

  if (!organization) return NextResponse.json({ error: "Organization not found" }, { status: 404 })

  return NextResponse.json(organization)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(session.user as any).isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const existing = await prisma.organization.findFirst({ where: { id, deletedAt: null } })
  if (!existing) return NextResponse.json({ error: "Organization not found" }, { status: 404 })

  const body = await request.json()
  const parsed = organizationUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 })
  }

  const slugInUse = await prisma.organization.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  })
  if (slugInUse) return NextResponse.json({ error: "Slug já está em uso" }, { status: 409 })

  const organization = await prisma.organization.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(organization)
}
