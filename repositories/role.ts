import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type RoleModel = Prisma.RoleModel
type RoleCreate = Prisma.RoleCreateInput
type RoleUpdate = Prisma.RoleUpdateInput

const roleInclude = {
  rolePermissions: {
    include: { permission: true },
  },
} as const

export class RoleRepository extends BaseRepository<RoleModel, RoleCreate, RoleUpdate> {
  protected get model() {
    return "role" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.role.findFirst({
      where: { id, organizationId },
      include: roleInclude,
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.role.findMany({
      where: { organizationId, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
      include: roleInclude,
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.role.count({
      where: { organizationId, ...where },
    })
  }

  async create(data: RoleCreate) {
    return prisma.role.create({ data, include: roleInclude })
  }

  async update(id: string, organizationId: string, data: RoleUpdate) {
    return prisma.role.update({
      where: { id, organizationId },
      data,
      include: roleInclude,
    })
  }

  async findByName(organizationId: string, name: string) {
    return prisma.role.findFirst({
      where: { organizationId, name },
      include: roleInclude,
    })
  }
}

export const roleRepository = new RoleRepository()
