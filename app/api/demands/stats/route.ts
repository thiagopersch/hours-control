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

  const clientNames = clientStats.length
    ? await prisma.client.findMany({
        where: { id: { in: clientStats.map((c) => c.clientId) }, organizationId },
        select: { id: true, name: true },
      })
    : []

  const analystNames = analystStats.length
    ? await prisma.analyst.findMany({
        where: { id: { in: analystStats.map((a) => a.analystId) }, organizationId },
        select: { id: true, name: true, color: true },
      })
    : []

  const clientMap = new Map(clientNames.map((c) => [c.id, c.name]))
  const analystMap = new Map(analystNames.map((a) => [a.id, a]))

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
  })
}
