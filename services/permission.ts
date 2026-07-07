import { BaseService } from "@/services/base"
import { PermissionRepository } from "@/repositories/permission"
import type { Permission } from "@/lib/generated/prisma/client"

type TCreate = Parameters<PermissionRepository["create"]>[0]
type TUpdate = Parameters<PermissionRepository["update"]>[2]

export class PermissionService extends BaseService<Permission, TCreate, TUpdate> {
  constructor() {
    super(new PermissionRepository(), "Permissão")
  }
}
