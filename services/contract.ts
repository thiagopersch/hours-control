import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { BaseService } from "@/services/base"
import { ContractRepository } from "@/repositories/contract"
import type { ClientContract } from "@/lib/generated/prisma/client"

type TCreate = Parameters<ContractRepository["create"]>[0]
type TUpdate = Parameters<ContractRepository["update"]>[2]

export class ContractService extends BaseService<ClientContract, TCreate, TUpdate> {
  constructor() {
    super(new ContractRepository(), "Contrato")
  }

  async getActiveContracts(organizationId: string): Promise<{ data?: ClientContract[]; error?: string }> {
    try {
      const data = await prisma.clientContract.findMany({
        where: {
          status: "ACTIVE",
          client: { organizationId, deletedAt: null },
          deletedAt: null,
        },
        include: { client: true },
        orderBy: { startDate: "desc" },
      })
      return { data: data as unknown as ClientContract[] }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar contratos ativos")
      return { error: "Erro ao buscar contratos ativos" }
    }
  }

  async getByClient(clientId: string): Promise<{ data?: ClientContract[]; error?: string }> {
    try {
      const data = await prisma.clientContract.findMany({
        where: { clientId, deletedAt: null },
        orderBy: { startDate: "desc" },
      })
      return { data }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar contratos do cliente")
      return { error: "Erro ao buscar contratos do cliente" }
    }
  }
}
