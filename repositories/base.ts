import { prisma } from "@/lib/prisma"
import type { PrismaClient } from "@/lib/generated/prisma/client"

export type PrismaTx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

export abstract class BaseRepository<T, TCreate, TUpdate> {
  protected abstract get model(): keyof typeof prisma

  async findById(id: string, organizationId: string): Promise<T | null> {
    return (prisma[this.model] as any).findFirst({
      where: { id, organizationId, deletedAt: null },
    }) as Promise<T | null>
  }

  async findMany(organizationId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }): Promise<T[]> {
    return (prisma[this.model] as any).findMany({
      where: { organizationId, deletedAt: null, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    }) as Promise<T[]>
  }

  async count(organizationId: string, where?: any): Promise<number> {
    return (prisma[this.model] as any).count({
      where: { organizationId, deletedAt: null, ...where },
    }) as Promise<number>
  }

  async create(data: TCreate): Promise<T> {
    return (prisma[this.model] as any).create({ data }) as Promise<T>
  }

  async update(id: string, organizationId: string, data: TUpdate): Promise<T> {
    return (prisma[this.model] as any).update({
      where: { id, organizationId },
      data,
    }) as Promise<T>
  }

  async softDelete(id: string, organizationId: string): Promise<T> {
    return (prisma[this.model] as any).update({
      where: { id, organizationId },
      data: { deletedAt: new Date() },
    }) as Promise<T>
  }
}
