import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getDemandAnalystScope } from "@/lib/scope"

const demandUpdateSchema = z.object({
  date: z.string().min(1).optional(),
  analystId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  requesterId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  demandTypeId: z.string().optional().nullable(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  durationMinutes: z.number().min(0).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ON_HOLD"]).optional(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const scopedAnalystId = getDemandAnalystScope(session)
  const demand = await prisma.demand.findFirst({
    where: {
      id,
      client: { organizationId },
      deletedAt: null,
      ...(scopedAnalystId ? { analystId: scopedAnalystId } : {}),
    },
    include: {
      analyst: { select: { id: true, name: true, email: true, color: true } },
      client: { select: { id: true, name: true, document: true } },
      requester: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } },
      demandType: { select: { id: true, name: true, color: true } },
      demandTags: { include: { tag: true } },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!demand) return NextResponse.json({ error: "Demand not found" }, { status: 404 })

  return NextResponse.json(demand)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const scopedAnalystId = getDemandAnalystScope(session)
  const existing = await prisma.demand.findFirst({
    where: {
      id,
      client: { organizationId },
      deletedAt: null,
      ...(scopedAnalystId ? { analystId: scopedAnalystId } : {}),
    },
  })

  if (!existing) return NextResponse.json({ error: "Demand not found" }, { status: 404 })

  const body = await request.json()
  const parsed = demandUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (
    scopedAnalystId &&
    parsed.data.analystId &&
    parsed.data.analystId !== scopedAnalystId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { tags, ...demandData } = parsed.data

  try {
    if (tags) {
      await prisma.demandTag.deleteMany({ where: { demandId: id } })
    }

    const demand = await prisma.demand.update({
      where: { id },
      data: {
        ...demandData,
        requesterId: demandData.requesterId === undefined ? undefined : demandData.requesterId || null,
        departmentId: demandData.departmentId === undefined ? undefined : demandData.departmentId || null,
        demandTypeId: demandData.demandTypeId === undefined ? undefined : demandData.demandTypeId || null,
        notes: demandData.notes === undefined ? undefined : demandData.notes || null,
        date: demandData.date ? new Date(demandData.date) : undefined,
        demandTags: tags
          ? {
              create: tags.map((tagId: string) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        analyst: { select: { id: true, name: true, color: true } },
        client: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        demandType: { select: { id: true, name: true, color: true } },
        demandTags: { include: { tag: true } },
      },
    })

    return NextResponse.json(demand)
  } catch (error) {
    logger.error({ error }, "Failed to update demand")
    return NextResponse.json({ error: "Erro ao atualizar demanda" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const scopedAnalystId = getDemandAnalystScope(session)
  const existing = await prisma.demand.findFirst({
    where: {
      id,
      client: { organizationId },
      deletedAt: null,
      ...(scopedAnalystId ? { analystId: scopedAnalystId } : {}),
    },
  })

  if (!existing) return NextResponse.json({ error: "Demand not found" }, { status: 404 })

  await prisma.demand.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Demand deleted" })
}
