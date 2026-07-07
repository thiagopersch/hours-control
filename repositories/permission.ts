import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type PermissionModel = Prisma.PermissionModel
type PermissionCreate = Prisma.PermissionCreateInput
type PermissionUpdate = Prisma.PermissionUpdateInput

export class PermissionRepository extends BaseRepository<PermissionModel, PermissionCreate, PermissionUpdate> {
  protected get model() {
    return "permission" as const
  }

  async findById(id: string, _organizationId: string) {
    return prisma.permission.findFirst({
      where: { id },
    })
  }

  async findMany(_organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.permission.findMany({
      where: { ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(_organizationId: string, where?: any) {
    return prisma.permission.count({
      where: { ...where },
    })
  }

  async create(data: PermissionCreate) {
    return prisma.permission.create({ data })
  }

  async update(id: string, _organizationId: string, data: PermissionUpdate) {
    return prisma.permission.update({
      where: { id },
      data,
    })
  }

  async findByResource(resource: string) {
    return prisma.permission.findMany({
      where: { resource },
      orderBy: { action: "asc" },
    })
  }
}

export const permissionRepository = new PermissionRepository()
