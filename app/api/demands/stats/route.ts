import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getDemandAnalystScope } from "@/lib/scope"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { searchParams } = request.nextUrl
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const clientId = searchParams.get("clientId")
  const analystId = searchParams.get("analystId")

  const dateFilter: Record<string, unknown> = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate) dateFilter.lte = new Date(endDate)

  const whereBase: Record<string, unknown> = {
    client: { organizationId },
    deletedAt: null,
  }
  if (Object.keys(dateFilter).length) whereBase.date = dateFilter
  if (clientId) whereBase.clientId = clientId
  if (analystId) whereBase.analystId = analystId

  const scopedAnalystId = getDemandAnalystScope(session)
  if (scopedAnalystId) whereBase.analystId = scopedAnalystId

  const [
    totalDemands,
    statusCounts,
    clientStats,
    analystStats,
    departmentStats,
    demandTypeStats,
    priorityStats,
    clientAnalystStats,
    monthlyEvolution,
  ] = await Promise.all([
    prisma.demand.count({ where: whereBase }),

    prisma.demand.groupBy({
      by: ["status"],
      where: whereBase,
      _count: { id: true },
    }),

    prisma.demand.groupBy({
      by: ["clientId"],
      where: whereBase,
      _count: { id: true },
      _sum: { durationMinutes: true },
      orderBy: { _sum: { durationMinutes: "desc" } },
      take: 10,
    }),

    prisma.demand.groupBy({
      by: ["analystId"],
      where: whereBase,
      _count: { id: true },
      _sum: { durationMinutes: true },
      orderBy: { _sum: { durationMinutes: "desc" } },
      take: 10,
    }),

    prisma.demand.groupBy({
      by: ["departmentId"],
      where: whereBase,
      _count: { id: true },
      _sum: { durationMinutes: true },
      orderBy: { _sum: { durationMinutes: "desc" } },
      take: 10,
    }),

    prisma.demand.groupBy({
      by: ["demandTypeId"],
      where: whereBase,
      _count: { id: true },
      _sum: { durationMinutes: true },
      orderBy: { _sum: { durationMinutes: "desc" } },
      take: 10,
    }),

    prisma.demand.groupBy({
      by: ["priority"],
      where: whereBase,
      _count: { id: true },
      _avg: { durationMinutes: true },
    }),

    // Per client+analyst breakdown, used to compute labor cost per client
    // (durationMinutes × Analyst.hourlyRate) without exposing per-demand data.
    prisma.demand.groupBy({
      by: ["clientId", "analystId"],
      where: whereBase,
      _sum: { durationMinutes: true },
    }),

    (() => {
      const params: any[] = [organizationId]
      let sql = `SELECT
        EXTRACT(YEAR FROM date)::int AS year,
        EXTRACT(MONTH FROM date)::int AS month,
        COALESCE(SUM(duration_minutes), 0)::bigint AS total,
        COUNT(*)::bigint AS count
      FROM "Demand"
      WHERE "client_id" IN (
        SELECT id FROM "Client" WHERE "organizationId" = $1
      )
      AND "deletedAt" IS NULL`
      if (startDate) {
        params.push(new Date(startDate).toISOString())
        sql += ` AND date >= $${params.length}::timestamp`
      }
      if (endDate) {
        params.push(new Date(endDate).toISOString())
        sql += ` AND date <= $${params.length}::timestamp`
      }
      if (clientId) {
        params.push(clientId)
        sql += ` AND "client_id" = $${params.length}`
      }
      if (whereBase.analystId) {
        params.push(whereBase.analystId as string)
        sql += ` AND "analyst_id" = $${params.length}`
      }
      sql += ` GROUP BY year, month ORDER BY year ASC, month ASC`
      return prisma.$queryRawUnsafe<
        { year: number; month: number; total: bigint; count: bigint }[]
      >(sql, ...params)
    })(),
  ])

  // Active contracts define the "hours sold" (contractedHours) and the
  // billing rate (hourlyRate) used for contract utilization and margin.
  const activeContracts = await prisma.clientContract.findMany({
    where: { status: "ACTIVE", client: { organizationId }, deletedAt: null },
    select: { clientId: true, contractedHours: true, hourlyRate: true },
  })

  const clientIdsForNames = new Set([
    ...clientStats.map((c) => c.clientId),
    ...activeContracts.map((c) => c.clientId),
  ])
  const clientNames = clientIdsForNames.size
    ? await prisma.client.findMany({
        where: { id: { in: [...clientIdsForNames] }, organizationId },
        select: { id: true, name: true },
      })
    : []

  const analystIdsForNames = new Set([
    ...analystStats.map((a) => a.analystId),
    ...clientAnalystStats.map((a) => a.analystId),
  ])
  const analystNames = analystIdsForNames.size
    ? await prisma.analyst.findMany({
        where: { id: { in: [...analystIdsForNames] }, organizationId },
        select: { id: true, name: true, color: true, hourlyRate: true },
      })
    : []

  const departmentIds = departmentStats.map((d) => d.departmentId).filter((id): id is string => !!id)
  const departmentNames = departmentIds.length
    ? await prisma.department.findMany({
        where: { id: { in: departmentIds }, organizationId },
        select: { id: true, name: true },
      })
    : []

  const demandTypeIds = demandTypeStats.map((d) => d.demandTypeId).filter((id): id is string => !!id)
  const demandTypeNames = demandTypeIds.length
    ? await prisma.demandType.findMany({
        where: { id: { in: demandTypeIds }, organizationId },
        select: { id: true, name: true, color: true },
      })
    : []

  const clientMap = new Map(clientNames.map((c) => [c.id, c.name]))
  const analystMap = new Map(analystNames.map((a) => [a.id, a]))
  const departmentMap = new Map(departmentNames.map((d) => [d.id, d.name]))
  const demandTypeMap = new Map(demandTypeNames.map((d) => [d.id, d]))
  const contractByClient = new Map(activeContracts.map((c) => [c.clientId, c]))

  // Labor cost and total minutes per client, derived from the same
  // client+analyst breakdown (not capped at top 10, unlike `clientStats`).
  const costByClient = new Map<string, number>()
  const minutesByClient = new Map<string, number>()
  for (const row of clientAnalystStats) {
    const hourlyRate = analystMap.get(row.analystId)?.hourlyRate ?? 0
    const minutes = row._sum.durationMinutes ?? 0
    const cost = (minutes / 60) * hourlyRate
    costByClient.set(row.clientId, (costByClient.get(row.clientId) ?? 0) + cost)
    minutesByClient.set(row.clientId, (minutesByClient.get(row.clientId) ?? 0) + minutes)
  }

  const clientFinancials = [...contractByClient.entries()].map(([clientId, contract]) => {
    const consumedMinutes = minutesByClient.get(clientId) ?? 0
    const revenue = (consumedMinutes / 60) * contract.hourlyRate
    const cost = costByClient.get(clientId) ?? 0
    return {
      clientId,
      clientName: clientMap.get(clientId) ?? "Unknown",
      contractedHours: contract.contractedHours,
      consumedHours: consumedMinutes / 60,
      revenue,
      cost,
      margin: revenue - cost,
    }
  })

  return NextResponse.json({
    total: totalDemands,
    byStatus: statusCounts.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    byClient: clientStats.map((c) => ({
      clientId: c.clientId,
      clientName: clientMap.get(c.clientId) ?? "Unknown",
      count: c._count.id,
      totalMinutes: c._sum.durationMinutes ?? 0,
    })),
    byAnalyst: analystStats.map((a) => ({
      analystId: a.analystId,
      analystName: analystMap.get(a.analystId)?.name ?? "Unknown",
      analystColor: analystMap.get(a.analystId)?.color ?? "#6366f1",
      count: a._count.id,
      totalMinutes: a._sum.durationMinutes ?? 0,
    })),
    monthlyEvolution: monthlyEvolution.map((m) => ({
      year: m.year,
      month: m.month,
      totalMinutes: Number(m.total),
      count: Number(m.count),
    })),
    byDepartment: departmentStats.map((d) => ({
      departmentId: d.departmentId,
      departmentName: d.departmentId ? departmentMap.get(d.departmentId) ?? "Unknown" : "Sem setor",
      count: d._count.id,
      totalMinutes: d._sum.durationMinutes ?? 0,
    })),
    byDemandType: demandTypeStats.map((d) => ({
      demandTypeId: d.demandTypeId,
      demandTypeName: d.demandTypeId ? demandTypeMap.get(d.demandTypeId)?.name ?? "Unknown" : "Sem tipo",
      demandTypeColor: d.demandTypeId ? demandTypeMap.get(d.demandTypeId)?.color ?? "#6366f1" : "#6b7280",
      count: d._count.id,
      totalMinutes: d._sum.durationMinutes ?? 0,
    })),
    byPriority: priorityStats.map((p) => ({
      priority: p.priority,
      count: p._count.id,
      avgMinutes: p._avg.durationMinutes ?? 0,
    })),
    clientFinancials,
  })
}
