import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { BaseService } from "@/services/base"
import { DemandRepository } from "@/repositories/demand"
import type { Demand } from "@/lib/generated/prisma/client"
import type { DemandStatus } from "@/lib/generated/prisma/enums"

type TCreate = Parameters<DemandRepository["create"]>[0]
type TUpdate = Parameters<DemandRepository["update"]>[2]

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

}
