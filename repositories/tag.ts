import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type TagModel = Prisma.TagModel
type TagCreate = Prisma.TagCreateInput
type TagUpdate = Prisma.TagUpdateInput

export class TagRepository extends BaseRepository<TagModel, TagCreate, TagUpdate> {
  protected get model() {
    return "tag" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.tag.findFirst({
      where: { id, organizationId },
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.tag.findMany({
      where: { organizationId, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.tag.count({
      where: { organizationId, ...where },
    })
  }

  async create(data: TagCreate) {
    return prisma.tag.create({ data })
  }

  async update(id: string, organizationId: string, data: TagUpdate) {
    return prisma.tag.update({
      where: { id, organizationId },
      data,
    })
  }

  
}

export const tagRepository = new TagRepository()
