import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { BaseService } from "@/services/base"
import { NotificationRepository } from "@/repositories/notification"
import type { Notification } from "@/lib/generated/prisma/client"

type TCreate = Parameters<NotificationRepository["create"]>[0]
type TUpdate = Parameters<NotificationRepository["update"]>[2]

export class NotificationService extends BaseService<Notification, TCreate, TUpdate> {
  constructor() {
    super(new NotificationRepository(), "Notificação")
  }

  async markAsRead(id: string, userId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      await prisma.notification.update({
        where: { id, userId },
        data: { readAt: new Date() },
      })
      return { success: true }
    } catch (error) {
      logger.error({ error }, "Erro ao marcar notificação como lida")
      return { error: "Erro ao marcar notificação como lida" }
    }
  }

  async getUnreadCount(userId: string): Promise<{ data?: number; error?: string }> {
    try {
      const count = await prisma.notification.count({
        where: { userId, readAt: null },
      })
      return { data: count }
    } catch (error) {
      logger.error({ error }, "Erro ao buscar contagem de notificações")
      return { error: "Erro ao buscar contagem de notificações" }
    }
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<{ data?: Notification; error?: string }> {
    try {
      const notification = await prisma.notification.create({
        data: { userId, type, title, body, data: data ? JSON.parse(JSON.stringify(data)) : {} },
      })
      return { data: notification }
    } catch (error) {
      logger.error({ error }, "Erro ao criar notificação")
      return { error: "Erro ao criar notificação" }
    }
  }
}
