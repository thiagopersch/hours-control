import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireScope, isGuardFailure, assertRecordAccess } from "@/lib/api-guard"

const contractUpdateSchema = z.object({
  clientId: z.string().min(1).optional(),
  contractedHours: z.number().int().min(1).optional(),
  hourlyRate: z.number().min(0).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "CANCELLED"]).optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "contract", "read")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const contract = await prisma.clientContract.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
    include: { client: { select: { id: true, name: true } } },
  })

  const denied = assertRecordAccess(session, "contract", "read", contract)
  if (denied) return denied

  return NextResponse.json(contract)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "contract", "update")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.clientContract.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "contract", "update", existing)
  if (denied) return denied

  const body = await request.json()
  const parsed = contractUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const data = parsed.data

  try {
    const contract = await prisma.clientContract.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : data.endDate === null ? null : undefined,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return NextResponse.json(contract)
  } catch (error) {
    logger.error({ error }, "Failed to update contract")
    return NextResponse.json({ error: "Erro ao atualizar contrato" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireScope(request, "contract", "delete")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const { id } = await params
  const existing = await prisma.clientContract.findFirst({
    where: { id, client: { organizationId }, deletedAt: null },
  })

  const denied = assertRecordAccess(session, "contract", "delete", existing)
  if (denied) return denied

  await prisma.clientContract.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Contract deleted" })
}
