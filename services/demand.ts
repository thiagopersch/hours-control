import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { BaseService } from "@/services/base"
import { DemandRepository } from "@/repositories/demand"
import type { Demand } from "@/lib/generated/prisma/client"
import type { DemandStatus } from "@/lib/generated/prisma/enums"

type TCreate = Parameters<DemandRepository["create"]>[0]
type TUpdate = Parameters<DemandRepository["update"]>[2]

type DashboardStats = {
  totalDemands: number
  totalCompleted: number
  totalHours: number
  byClient: { clientId: string; clientName: string; count: number; hours: number }[]
  byAnalyst: { analystId: string; analystName: string; count: number; hours: number }[]
  byStatus: { status: string; count: number }[]
  byMonth: { month: string; count: number; hours: number }[]
}

export class DemandService extends BaseService<Demand, TCreate, TUpdate> {
  constructor() {
    super(new DemandRepository(), "Demanda")
  }

  async getByAnalyst(analystId: string, organizationId: string): Promise<{ data?: Demand[]; error?: string }> {
    try {
      const data = await prisma.demand.findMany({
        where: { analystId, client: { organizationId }, deletedAt: null },
        include: { client: true, analyst: true },
        orderBy: { date: "desc" },
      })
      return { data: data as unknown as Demand[] }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar demandas do analista")
      return { error: "Erro ao buscar demandas do analista" }
    }
  }

  async getByClient(clientId: string): Promise<{ data?: Demand[]; error?: string }> {
    try {
      const data = await prisma.demand.findMany({
        where: { clientId, deletedAt: null },
        include: { client: true, analyst: true },
        orderBy: { date: "desc" },
      })
      return { data: data as unknown as Demand[] }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar demandas do cliente")
      return { error: "Erro ao buscar demandas do cliente" }
    }
  }

  async getByStatus(status: DemandStatus, organizationId: string): Promise<{ data?: Demand[]; error?: string }> {
    try {
      const data = await prisma.demand.findMany({
        where: { status: status as any, client: { organizationId }, deletedAt: null },
        include: { client: true, analyst: true },
        orderBy: { date: "desc" },
      })
      return { data: data as unknown as Demand[] }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar demandas por status")
      return { error: "Erro ao buscar demandas por status" }
    }
  }

  async getByPeriod(
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<{ data?: Demand[]; error?: string }> {
    try {
      const data = await prisma.demand.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          client: { organizationId },
          deletedAt: null,
        },
        include: { client: true, analyst: true },
        orderBy: { date: "desc" },
      })
      return { data: data as unknown as Demand[] }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar demandas por período")
      return { error: "Erro ao buscar demandas por período" }
    }
  }

  async getDashboardStats(organizationId: string): Promise<{ data?: DashboardStats; error?: string }> {
    try {
      const [totalDemands, totalCompleted, hoursAgg, byClient, byAnalyst, byStatus, byMonthRaw] = await Promise.all([
        prisma.demand.count({
          where: { client: { organizationId }, deletedAt: null },
        }),
        prisma.demand.count({
          where: { status: "COMPLETED" as any, client: { organizationId }, deletedAt: null },
        }),
        prisma.demand.aggregate({
          where: { client: { organizationId }, deletedAt: null },
          _sum: { durationMinutes: true },
        }),
        prisma.demand.groupBy({
          by: ["clientId"],
          where: { client: { organizationId }, deletedAt: null },
          _count: { id: true },
          _sum: { durationMinutes: true },
        }),
        prisma.demand.groupBy({
          by: ["analystId"],
          where: { client: { organizationId }, deletedAt: null },
          _count: { id: true },
          _sum: { durationMinutes: true },
        }),
        prisma.demand.groupBy({
          by: ["status"],
          where: { client: { organizationId }, deletedAt: null },
          _count: { id: true },
        }),
        prisma.$queryRawUnsafe<{ month: string; count: bigint; hours: bigint }[]>(
          `SELECT
            TO_CHAR(date, 'YYYY-MM') AS month,
            COUNT(*)::int AS count,
            COALESCE(SUM(duration_minutes), 0)::int AS hours
          FROM demand
          WHERE "clientId" IN (SELECT id FROM "Client" WHERE "organizationId" = $1 AND "deletedAt" IS NULL)
            AND "deletedAt" IS NULL
          GROUP BY month
          ORDER BY month ASC`,
          organizationId
        ),
      ])

      const [clientNames, analystNames] = await Promise.all([
        prisma.client.findMany({
          where: { organizationId, deletedAt: null },
          select: { id: true, name: true },
        }),
        prisma.analyst.findMany({
          where: { organizationId, deletedAt: null },
          select: { id: true, name: true },
        }),
      ])

      const clientMap = new Map(clientNames.map((c) => [c.id, c.name]))
      const analystMap = new Map(analystNames.map((a) => [a.id, a.name]))

      const stats: DashboardStats = {
        totalDemands,
        totalCompleted,
        totalHours: hoursAgg._sum.durationMinutes ?? 0,
        byClient: byClient.map((item) => ({
          clientId: item.clientId,
          clientName: clientMap.get(item.clientId) ?? "Desconhecido",
          count: item._count.id,
          hours: item._sum.durationMinutes ?? 0,
        })),
        byAnalyst: byAnalyst.map((item) => ({
          analystId: item.analystId,
          analystName: analystMap.get(item.analystId) ?? "Desconhecido",
          count: item._count.id,
          hours: item._sum.durationMinutes ?? 0,
        })),
        byStatus: byStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
        byMonth: byMonthRaw.map((item) => ({
          month: item.month,
          count: Number(item.count),
          hours: Number(item.hours),
        })),
      }

      return { data: stats }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar estatísticas do dashboard")
      return { error: "Erro ao buscar estatísticas do dashboard" }
    }
  }
}
