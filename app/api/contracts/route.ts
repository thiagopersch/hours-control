import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

const contractCreateSchema = z.object({
  clientId: z.string().min(1),
  contractedHours: z.number().int().min(1),
  hourlyRate: z.number().min(0),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "CANCELLED"]),
})

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "contract", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")

  const filters: Record<string, unknown> = {}
  if (clientId) filters.clientId = clientId
  if (status) filters.status = status

  const where: Record<string, unknown> = {
    client: { organizationId },
    deletedAt: null,
    AND: [scopeWhere, filters],
  }

  const contracts = await prisma.clientContract.findMany({
    where,
    include: { client: { select: { id: true, name: true } } },
    orderBy: { startDate: "asc" },
  })

  // One query for every contract's client instead of one `demand.aggregate`
  // per contract (was an N+1). Each contract has its own start/end window,
  // so the per-contract sum is computed in memory from this single fetch
  // rather than via a single ungrouped-by-date aggregate.
  const clientIds = [...new Set(contracts.map((c) => c.clientId))]
  const demandsForClients = clientIds.length
    ? await prisma.demand.findMany({
        where: { clientId: { in: clientIds }, deletedAt: null },
        select: { clientId: true, date: true, durationMinutes: true },
      })
    : []

  const withBalance = contracts.map((contract) => {
    const consumedMinutes = demandsForClients
      .filter(
        (d) =>
          d.clientId === contract.clientId &&
          d.date >= contract.startDate &&
          (!contract.endDate || d.date <= contract.endDate)
      )
      .reduce((sum, d) => sum + d.durationMinutes, 0)
    const balanceMinutes = contract.contractedHours * 60 - consumedMinutes
    return { ...contract, consumedMinutes, balanceMinutes }
  })

  return NextResponse.json(withBalance)
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "contract", "create")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const body = await request.json()
  const parsed = contractCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const data = parsed.data

  try {
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, organizationId, deletedAt: null },
    })
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

    const contract = await prisma.clientContract.create({
      data: {
        clientId: data.clientId,
        contractedHours: data.contractedHours,
        hourlyRate: data.hourlyRate,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes ?? null,
        status: data.status,
        createdById: session.user.id,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    logger.error({ error }, "Failed to create contract")
    return NextResponse.json({ error: "Erro ao criar contrato" }, { status: 500 })
  }
}
