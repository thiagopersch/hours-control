import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type DepartmentModel = Prisma.DepartmentModel
type DepartmentCreate = Prisma.DepartmentCreateInput
type DepartmentUpdate = Prisma.DepartmentUpdateInput

export class DepartmentRepository extends BaseRepository<DepartmentModel, DepartmentCreate, DepartmentUpdate> {
  protected get model() {
    return "department" as const
  }

  async findById(id: string, organizationId: string) {
    return prisma.department.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    })
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.department.findMany({
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
    return prisma.department.count({
      where: {
        organizationId,
        deletedAt: null,
        ...where,
      },
    })
  }

  async create(data: DepartmentCreate) {
    return prisma.department.create({ data })
  }

  async update(id: string, organizationId: string, data: DepartmentUpdate) {
    return prisma.department.update({
      where: { id },
      data,
    })
  }

  async softDelete(id: string, organizationId: string) {
    return prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export const departmentRepository = new DepartmentRepository()
