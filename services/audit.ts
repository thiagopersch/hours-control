import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import type { AuditLog } from "@/lib/generated/prisma/client"

type LogActionParams = {
  entityType: string
  entityId: string
  action: string
  field?: string
  oldValue?: string
  newValue?: string
  organizationId: string
  userId?: string
  ip?: string
  userAgent?: string
}

export class AuditService {
  async log(params: LogActionParams): Promise<{ success?: boolean; error?: string }> {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: params.entityType,
          entityId: params.entityId,
          action: params.action,
          field: params.field,
          oldValue: params.oldValue,
          newValue: params.newValue,
          organizationId: params.organizationId,
          userId: params.userId,
          ip: params.ip,
          userAgent: params.userAgent,
        },
      })
      return { success: true }
    } catch (error) {
      logger.error({ error }, "Erro ao registrar log de auditoria")
      return { error: "Erro ao registrar log de auditoria" }
    }
  }

  async getByEntity(
    entityType: string,
    entityId: string,
    organizationId: string
  ): Promise<{ data?: AuditLog[]; error?: string }> {
    try {
      const data = await prisma.auditLog.findMany({
        where: { entityType, entityId, organizationId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      return { data: data as unknown as AuditLog[] }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar logs de auditoria")
      return { error: "Erro ao buscar logs de auditoria" }
    }
  }
}
