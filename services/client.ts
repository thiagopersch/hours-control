import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import type { Client } from "@/lib/generated/prisma/client"
import { BaseService } from "@/services/base"
import { ClientRepository } from "@/repositories/client"

type TCreate = Parameters<ClientRepository["create"]>[0]
type TUpdate = Parameters<ClientRepository["update"]>[2]

export class ClientService extends BaseService<Client, TCreate, TUpdate> {
  constructor() {
    super(new ClientRepository(), "Cliente")
  }

  async toggleFavorite(id: string, organizationId: string): Promise<{ data?: Client; error?: string }> {
    try {
      const existing = await this.repository.findById(id, organizationId)
      if (!existing) return { error: "Cliente não encontrado" }
      const data = await this.repository.update(id, organizationId, { favorite: !(existing as any).favorite })
      return { data }
    } catch (error) {
      logger.error({ error }, "Erro ao alternar favorito do cliente")
      return { error: "Erro ao alternar favorito do cliente" }
    }
  }

  async search(query: string, organizationId: string): Promise<{ data?: Client[]; error?: string }> {
    try {
      const data = await prisma.client.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { document: { contains: query, mode: "insensitive" } },
            { legalName: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
        take: 50,
      })
      return { data }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar clientes")
      return { error: "Erro ao buscar clientes" }
    }
  }
}
