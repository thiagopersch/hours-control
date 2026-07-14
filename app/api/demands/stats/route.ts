import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import { requireScope, isGuardFailure } from "@/lib/api-guard"

export async function GET(request: NextRequest) {
  const guard = await requireScope(request, "demand", "read")
  if (isGuardFailure(guard)) return guard
  const { organizationId, scopeWhere } = guard

  const { searchParams } = request.nextUrl
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const clientId = searchParams.get("clientId")
  const analystId = searchParams.get("analystId")

  const dateFilter: Record<string, unknown> = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate) dateFilter.lte = new Date(endDate)

  const filters: Record<string, unknown> = {}
  if (Object.keys(dateFilter).length) filters.date = dateFilter
  if (clientId) filters.clientId = clientId
  if (analystId) filters.analystId = analystId

  // AND (not merge) scopeWhere with the caller's own query filters, so a
  // ?analystId= a user isn't scoped to can never override the security filter.
  const whereBase: Record<string, unknown> = {
    client: { organizationId },
    deletedAt: null,
    AND: [scopeWhere, filters],
  }

  // The raw SQL query below can't reuse the Prisma `where` object, so the
  // same scope constraints are re-derived here explicitly.
  const scopeAnalystId = (scopeWhere as any).analystId as string | undefined
  const scopeClientId = (scopeWhere as any).clientId as string | undefined
  const scopeDepartmentId = (scopeWhere as any).departmentId as string | undefined
  const scopeTeamId = (scopeWhere as any).analyst?.teamId as string | undefined

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
      if (analystId) {
        params.push(analystId)
        sql += ` AND "analyst_id" = $${params.length}`
      }
      if (scopeClientId) {
        params.push(scopeClientId)
        sql += ` AND "client_id" = $${params.length}`
      }
      if (scopeAnalystId) {
        params.push(scopeAnalystId)
        sql += ` AND "analyst_id" = $${params.length}`
      }
      if (scopeDepartmentId) {
        params.push(scopeDepartmentId)
        sql += ` AND "department_id" = $${params.length}`
      }
      if (scopeTeamId) {
        params.push(scopeTeamId)
        sql += ` AND "analyst_id" IN (SELECT id FROM "Analyst" WHERE "teamId" = $${params.length})`
      }
      sql += ` GROUP BY year, month ORDER BY year ASC, month ASC`
      return prisma.$queryRawUnsafe<
        { year: number; month: number; total: bigint; count: bigint }[]
      >(sql, ...params)
    })(),
  ])

  // Active contracts define the "hours sold" (contractedHours) and the
  // billing rate (hourlyRate) used for contract utilization and margin.
  const [activeContracts, clientNames, analystNames, departmentNames, demandTypeNames] =
    await Promise.all([
      prisma.clientContract.findMany({
        where: {
          status: "ACTIVE",
          client: { organizationId, ...(scopeClientId ? { id: scopeClientId } : {}) },
          deletedAt: null,
        },
        select: { clientId: true, contractedHours: true, hourlyRate: true },
      }),
      prisma.client.findMany({
        where: { organizationId, ...(scopeClientId ? { id: scopeClientId } : {}) },
        select: { id: true, name: true },
      }),
      prisma.analyst.findMany({
        where: { organizationId },
        select: { id: true, name: true, color: true, hourlyRate: true },
      }),
      prisma.department.findMany({
        where: { organizationId },
        select: { id: true, name: true },
      }),
      prisma.demandType.findMany({
        where: { organizationId },
        select: { id: true, name: true, color: true },
      }),
    ])

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
