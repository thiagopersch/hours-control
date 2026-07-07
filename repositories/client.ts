import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type ClientModel = Prisma.ClientModel
type ClientCreate = Prisma.ClientCreateInput
type ClientUpdate = Prisma.ClientUpdateInput

export class ClientRepository extends BaseRepository<ClientModel, ClientCreate, ClientUpdate> {
  protected get model() {
    return "client" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.client.findFirst({
      where: { id, organizationId, deletedAt: null },
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.client.findMany({
      where: { organizationId, deletedAt: null, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.client.count({
      where: { organizationId, deletedAt: null, ...where },
    })
  }

  async create(data: ClientCreate) {
    return prisma.client.create({ data })
  }

  async update(id: string, organizationId: string, data: ClientUpdate) {
    return prisma.client.update({
      where: { id, organizationId },
      data,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.client.update({
      where: { id, organizationId },
      data: { deletedAt: new Date() },
    })
  }

  async searchFavorites(organizationId: string) {
    return prisma.client.findMany({
      where: { organizationId, favorite: true, deletedAt: null },
      orderBy: { name: "asc" },
    })
  }

  async searchByName(organizationId: string, query: string) {
    return prisma.client.findMany({
      where: {
        organizationId,
        deletedAt: null,
        name: { contains: query, mode: "insensitive" },
      },
      orderBy: { name: "asc" },
      take: 20,
    })
  }
}

export const clientRepository = new ClientRepository()
