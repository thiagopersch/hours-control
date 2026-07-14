import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"
import { canAccessRecord } from "@/lib/policy"

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

// Demand access denials use a 403 (not the usual existence-hiding 404) so the
// frontend can distinguish "forbidden" and run its access-denied redirect flow.
const HIDE_EXISTENCE = false

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "demand", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const demand = await prisma.demand.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
    include: {
      analyst: { select: { id: true, name: true, email: true, color: true, teamId: true } },
      client: { select: { id: true, name: true, document: true } },
      requester: { select: { id: true, name: true, email: true } },
      department: { select: { id: true, name: true } },
      demandType: { select: { id: true, name: true, color: true } },
      demandTags: { include: { tag: true } },
      attachments: { orderBy: { createdAt: "desc" } },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            include: { user: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  const denied = assertRecordAccess(session, "demand", "read", demand, HIDE_EXISTENCE)
  if (denied) return denied

  return NextResponse.json(demand)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "demand", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.demand.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
    include: { analyst: { select: { teamId: true } } },
  })

  const denied = assertRecordAccess(session, "demand", "update", existing, HIDE_EXISTENCE)
  if (denied) return denied

  const body = await request.json()
  const parsed = demandUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  if (parsed.data.analystId || parsed.data.clientId) {
    const merged = { ...existing, ...parsed.data }
    if (!canAccessRecord(session, "demand", "update", merged)) {
      return NextResponse.json(
        { error: "Você não tem permissão para reatribuir esta demanda." },
        { status: 403 }
      )
    }
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
        requesterId: demandData.requesterId === undefined ? undefined : demandData.requesterId ?? null,
        departmentId: demandData.departmentId === undefined ? undefined : demandData.departmentId ?? null,
        demandTypeId: demandData.demandTypeId === undefined ? undefined : demandData.demandTypeId ?? null,
        notes: demandData.notes === undefined ? undefined : demandData.notes ?? null,
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
  const guard = await requireScope(request, "demand", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.demand.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
    include: { analyst: { select: { teamId: true } } },
  })

  const denied = assertRecordAccess(session, "demand", "delete", existing, HIDE_EXISTENCE)
  if (denied) return denied

  await prisma.demand.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Demand deleted" })
}
