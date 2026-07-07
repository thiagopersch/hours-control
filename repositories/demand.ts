import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type DemandModel = Prisma.DemandModel
type DemandCreate = Prisma.DemandCreateInput
type DemandUpdate = Prisma.DemandUpdateInput

const demandInclude = {
  analyst: true,
  client: true,
  requester: true,
  department: true,
  demandType: true,
  demandTags: {
    include: { tag: true },
  },
  attachments: true,
} as const

export class DemandRepository extends BaseRepository<DemandModel, DemandCreate, DemandUpdate> {
  protected get model() {
    return "demand" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.demand.findFirst({
      where: {
        id,
        client: { organizationId },
        deletedAt: null,
      },
      include: demandInclude,
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.demand.findMany({
      where: {
        client: { organizationId },
        deletedAt: null,
        ...params?.where,
      },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
      include: demandInclude,
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.demand.count({
      where: {
        client: { organizationId },
        deletedAt: null,
        ...where,
      },
    })
  }

  async create(data: DemandCreate) {
    return prisma.demand.create({ data, include: demandInclude })
  }

  async update(id: string, organizationId: string, data: DemandUpdate) {
    return prisma.demand.update({
      where: { id },
      data,
      include: demandInclude,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.demand.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async findByClient(clientId: string, organizationId: string) {
    return prisma.demand.findMany({
      where: { clientId, client: { organizationId }, deletedAt: null },
      include: demandInclude,
      orderBy: { date: "desc" },
    })
  }

  async findByAnalyst(analystId: string, organizationId: string) {
    return prisma.demand.findMany({
      where: { analystId, client: { organizationId }, deletedAt: null },
      include: demandInclude,
      orderBy: { date: "desc" },
    })
  }
}

export const demandRepository = new DemandRepository()
