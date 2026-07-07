import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type DemandTypeModel = Prisma.DemandTypeModel
type DemandTypeCreate = Prisma.DemandTypeCreateInput
type DemandTypeUpdate = Prisma.DemandTypeUpdateInput

export class DemandTypeRepository extends BaseRepository<DemandTypeModel, DemandTypeCreate, DemandTypeUpdate> {
  protected get model() {
    return "demandType" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.demandType.findFirst({
      where: { id, organizationId, deletedAt: null },
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.demandType.findMany({
      where: { organizationId, deletedAt: null, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.demandType.count({
      where: { organizationId, deletedAt: null, ...where },
    })
  }

  async create(data: DemandTypeCreate) {
    return prisma.demandType.create({ data })
  }

  async update(id: string, organizationId: string, data: DemandTypeUpdate) {
    return prisma.demandType.update({
      where: { id, organizationId },
      data,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.demandType.update({
      where: { id, organizationId },
      data: { deletedAt: new Date() },
    })
  }
}

export const demandTypeRepository = new DemandTypeRepository()
