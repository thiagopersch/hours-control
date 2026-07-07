import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"
import { BaseRepository } from "@/repositories/base"

type NotificationModel = Prisma.NotificationModel
type NotificationCreate = Prisma.NotificationCreateInput
type NotificationUpdate = Prisma.NotificationUpdateInput

export class NotificationRepository extends BaseRepository<NotificationModel, NotificationCreate, NotificationUpdate> {
  protected get model() {
    return "notification" as const
  }

  async findById(id: string, _organizationId: string) {
    return prisma.notification.findFirst({
      where: { id },
    })
  }

  async findMany(userId: string, params?: { skip?: number; take?: number; orderBy?: any; where?: any }) {
    return prisma.notification.findMany({
      where: { userId, ...params?.where },
      skip: params?.skip,
      take: params?.take ?? 50,
      orderBy: params?.orderBy ?? { createdAt: "desc" },
    })
  }

  async count(userId: string, where?: any) {
    return prisma.notification.count({
      where: { userId, ...where },
    })
  }

  async create(data: NotificationCreate) {
    return prisma.notification.create({ data })
  }

  async update(id: string, _organizationId: string, data: NotificationUpdate) {
    return prisma.notification.update({
      where: { id },
      data,
    })
  }

  async findUnreadByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId, readAt: null },
      orderBy: { createdAt: "desc" },
    })
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  }

  async countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, readAt: null },
    })
  }
}

export const notificationRepository = new NotificationRepository()
