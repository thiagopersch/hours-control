import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { BaseService } from "@/services/base"
import { RoleRepository } from "@/repositories/role"
import type { Role } from "@/lib/generated/prisma/client"

type TCreate = Parameters<RoleRepository["create"]>[0]
type TUpdate = Parameters<RoleRepository["update"]>[2]

type RoleWithPermissions = {
  rolePermissions?: { permission: { id: string; resource: string; action: string; description: string | null } }[]
  _count?: { userRoles: number }
} & Role

export class RoleService extends BaseService<Role, TCreate, TUpdate> {
  constructor() {
    super(new RoleRepository(), "Perfil")
  }

  async getWithPermissions(id: string, organizationId: string): Promise<{ data?: RoleWithPermissions; error?: string }> {
    try {
      const data = await prisma.role.findFirst({
        where: { id, organizationId },
        include: {
          rolePermissions: {
            include: { permission: { select: { id: true, resource: true, action: true, description: true } } },
          },
          _count: { select: { userRoles: true } },
        },
      })
      if (!data) return { error: "Perfil não encontrado" }
      return { data: data as unknown as RoleWithPermissions }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar perfil com permissões")
      return { error: "Erro ao buscar perfil com permissões" }
    }
  }
}
