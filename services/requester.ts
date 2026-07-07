import { RequesterRepository } from "@/repositories/requester"
import type { Requester } from "@/lib/generated/prisma/client"
import { BaseService } from "@/services/base"

type TCreate = Parameters<RequesterRepository["create"]>[0]
type TUpdate = Parameters<RequesterRepository["update"]>[2]

export class RequesterService extends BaseService<Requester, TCreate, TUpdate> {
  constructor() {
    super(new RequesterRepository(), "Solicitante")
  }
}
