import { DepartmentRepository } from "@/repositories/department"
import type { Department } from "@/lib/generated/prisma/client"
import { BaseService } from "@/services/base"

type TCreate = Parameters<DepartmentRepository["create"]>[0]
type TUpdate = Parameters<DepartmentRepository["update"]>[2]

export class DepartmentService extends BaseService<Department, TCreate, TUpdate> {
  constructor() {
    super(new DepartmentRepository(), "Setor")
  }
}
