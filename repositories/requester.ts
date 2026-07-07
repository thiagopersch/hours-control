import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type RequesterModel = Prisma.RequesterModel
type RequesterCreate = Prisma.RequesterCreateInput
type RequesterUpdate = Prisma.RequesterUpdateInput

export class RequesterRepository extends BaseRepository<RequesterModel, RequesterCreate, RequesterUpdate> {
  protected get model() {
    return "requester" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.requester.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.requester.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...params?.where,
      },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.requester.count({
      where: {
        organizationId,
        deletedAt: null,
        ...where,
      },
    })
  }

  async create(data: RequesterCreate) {
    return prisma.requester.create({ data })
  }

  async update(id: string, organizationId: string, data: RequesterUpdate) {
    return prisma.requester.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.requester.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export const requesterRepository = new RequesterRepository()
