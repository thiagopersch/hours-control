import { BaseService } from "@/services/base"
import { DemandTypeRepository } from "@/repositories/demand-type"
import type { DemandType } from "@/lib/generated/prisma/client"

type TCreate = Parameters<DemandTypeRepository["create"]>[0]
type TUpdate = Parameters<DemandTypeRepository["update"]>[2]

export class DemandTypeService extends BaseService<DemandType, TCreate, TUpdate> {
  constructor() {
    super(new DemandTypeRepository(), "Tipo de Demanda")
  }
}
