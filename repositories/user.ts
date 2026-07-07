import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type UserModel = Prisma.UserModel
type UserCreate = Prisma.UserCreateInput
type UserUpdate = Prisma.UserUpdateInput

const userInclude = {
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
    },
  },
} as const

export class UserRepository extends BaseRepository<UserModel, UserCreate, UserUpdate> {
  protected get model() {
    return "user" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.user.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: userInclude,
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.user.findMany({
      where: { organizationId, deletedAt: null, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
      include: userInclude,
    })
  }

  async count(organizationId: string, where?: any) {
    return prisma.user.count({
      where: { organizationId, deletedAt: null, ...where },
    })
  }

  async create(data: UserCreate) {
    return prisma.user.create({ data, include: userInclude })
  }

  async update(id: string, organizationId: string, data: UserUpdate) {
    return prisma.user.update({
      where: { id, organizationId },
      data,
      include: userInclude,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.user.update({
      where: { id, organizationId },
      data: { deletedAt: new Date() },
    })
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: userInclude,
    })
  }
}

export const userRepository = new UserRepository()
