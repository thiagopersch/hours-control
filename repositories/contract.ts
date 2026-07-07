import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type ClientContractModel = Prisma.ClientContractModel
type ClientContractCreate = Prisma.ClientContractCreateInput
type ClientContractUpdate = Prisma.ClientContractUpdateInput

export class ContractRepository extends BaseRepository<ClientContractModel, ClientContractCreate, ClientContractUpdate> {
  protected get model() {
    return "clientContract" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.clientContract.findFirst({
      where: {
        id,
        client: { organizationId },
        deletedAt: null,
      },
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.clientContract.findMany({
      where: {
        client: { organizationId },
        deletedAt: null,
        ...params?.where,
      },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.clientContract.count({
      where: {
        client: { organizationId },
        deletedAt: null,
        ...where,
      },
    })
  }

  async create(data: ClientContractCreate) {
    return prisma.clientContract.create({ data })
  }

  async update(id: string, organizationId: string, data: ClientContractUpdate) {
    return prisma.clientContract.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.clientContract.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async findByClient(clientId: string) {
    return prisma.clientContract.findMany({
      where: { clientId, deletedAt: null },
      orderBy: { startDate: "desc" },
    })
  }

  async findActiveByClient(clientId: string) {
    return prisma.clientContract.findMany({
      where: {
        clientId,
        deletedAt: null,
        status: "ACTIVE",
      },
      orderBy: { startDate: "desc" },
    })
  }

  async findActive(organizationId: string) {
    return prisma.clientContract.findMany({
      where: {
        client: { organizationId },
        deletedAt: null,
        status: "ACTIVE",
      },
      include: { client: true },
      orderBy: { startDate: "desc" },
    })
  }
}

export const contractRepository = new ContractRepository()
