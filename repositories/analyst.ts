import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type AnalystModel = Prisma.AnalystModel
type AnalystCreate = Prisma.AnalystCreateInput
type AnalystUpdate = Prisma.AnalystUpdateInput

export class AnalystRepository extends BaseRepository<AnalystModel, AnalystCreate, AnalystUpdate> {
  protected get model() {
    return "analyst" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.analyst.findFirst({
      where: { id, organizationId, deletedAt: null },
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.analyst.findMany({
      where: { organizationId, deletedAt: null, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.analyst.count({
      where: { organizationId, deletedAt: null, ...where },
    })
  }

  async create(data: AnalystCreate) {
    return prisma.analyst.create({ data })
  }

  async update(id: string, organizationId: string, data: AnalystUpdate) {
    return prisma.analyst.update({
      where: { id, organizationId },
      data,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.analyst.update({
      where: { id, organizationId },
      data: { deletedAt: new Date() },
    })
  }
}

export const analystRepository = new AnalystRepository()
