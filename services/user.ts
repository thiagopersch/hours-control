import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { BaseService } from "@/services/base"
import { UserRepository } from "@/repositories/user"
import type { User } from "@/lib/generated/prisma/client"

type TCreate = Parameters<UserRepository["create"]>[0]
type TUpdate = Parameters<UserRepository["update"]>[2]

export class UserService extends BaseService<User, TCreate, TUpdate> {
  constructor() {
    super(new UserRepository(), "Usuário")
  }

  async getByRole(roleName: string, organizationId: string): Promise<{ data?: User[]; error?: string }> {
    try {
      const data = await prisma.user.findMany({
        where: {
          organizationId,
          deletedAt: null,
          userRoles: { some: { role: { name: roleName, organizationId } } },
        },
        include: { userRoles: { include: { role: true } } },
        orderBy: { name: "asc" },
      })
      return { data: data as unknown as User[] }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar usuários por perfil")
      return { error: "Erro ao buscar usuários por perfil" }
    }
  }

  async search(query: string, organizationId: string): Promise<{ data?: User[]; error?: string }> {
    try {
      const data = await prisma.user.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
        take: 50,
      })
      return { data }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar usuários")
      return { error: "Erro ao buscar usuários" }
    }
  }
}
