import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "analyst", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = { organizationId, deletedAt: null, ...scopeWhere }
  if (status) where.status = status
  if (search) where.name = { contains: search, mode: "insensitive" }

  const analysts = await prisma.analyst.findMany({
    where,
    orderBy: { name: "asc" },
  })

  const withActiveClientsCount = await Promise.all(
    analysts.map(async (analyst) => {
      const demandClients = await prisma.demand.findMany({
        where: { analystId: analyst.id, deletedAt: null },
        select: { clientId: true },
        distinct: ["clientId"],
      })
      const clientIds = demandClients.map((d) => d.clientId)
      const activeClientsCount = clientIds.length
        ? await prisma.client.count({
            where: {
              id: { in: clientIds },
              deletedAt: null,
              contracts: { some: { status: "ACTIVE", deletedAt: null } },
            },
          })
        : 0
      return { ...analyst, activeClientsCount }
    })
  )

  return NextResponse.json(withActiveClientsCount)
}

export async function POST(request: NextRequest) {
  const guard = await requireScope(request, "analyst", "create")
  if (isGuardFailure(guard)) return guard
  const { session, organizationId } = guard

  const body = await request.json()
  const analyst = await prisma.analyst.create({
    data: {
      ...body,
      organizationId,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(analyst, { status: 201 })
}
