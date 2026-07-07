import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { BaseService } from "@/services/base"
import { AnalystRepository } from "@/repositories/analyst"
import type { Analyst } from "@/lib/generated/prisma/client"

type TCreate = Parameters<AnalystRepository["create"]>[0]
type TUpdate = Parameters<AnalystRepository["update"]>[2]

export class AnalystService extends BaseService<Analyst, TCreate, TUpdate> {
  constructor() {
    super(new AnalystRepository(), "Analista")
  }

  async search(query: string, organizationId: string): Promise<{ data?: Analyst[]; error?: string }> {
    try {
      const data = await prisma.analyst.findMany({
        where: {
          organizationId,
          deletedAt: null,
          name: { contains: query, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
        take: 50,
      })
      return { data }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar analistas")
      return { error: "Erro ao buscar analistas" }
    }
  }

  async getByTeam(team: string, organizationId: string): Promise<{ data?: Analyst[]; error?: string }> {
    try {
      const data = await prisma.analyst.findMany({
        where: { organizationId, deletedAt: null, team },
        orderBy: { name: "asc" },
      })
      return { data }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar analistas por equipe")
      return { error: "Erro ao buscar analistas por equipe" }
    }
  }
}
