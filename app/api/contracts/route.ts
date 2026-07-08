import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

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
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { searchParams } = request.nextUrl
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {
    client: { organizationId },
    deletedAt: null,
  }
  if (clientId) where.clientId = clientId
  if (status) where.status = status

  const contracts = await prisma.clientContract.findMany({
    where,
    include: { client: { select: { id: true, name: true } } },
    orderBy: { startDate: "asc" },
  })

  const withBalance = await Promise.all(
    contracts.map(async (contract) => {
      const dateFilter: Record<string, Date> = { gte: contract.startDate }
      if (contract.endDate) dateFilter.lte = contract.endDate

      const sum = await prisma.demand.aggregate({
        where: {
          clientId: contract.clientId,
          deletedAt: null,
          date: dateFilter,
        },
        _sum: { durationMinutes: true },
      })

      const consumedMinutes = sum._sum.durationMinutes ?? 0
      const balanceMinutes = contract.contractedHours * 60 - consumedMinutes

      return { ...contract, consumedMinutes, balanceMinutes }
    })
  )

  return NextResponse.json(withBalance)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

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
        notes: data.notes || null,
        status: data.status,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    logger.error({ error }, "Failed to create contract")
    return NextResponse.json({ error: "Erro ao criar contrato" }, { status: 500 })
  }
}
