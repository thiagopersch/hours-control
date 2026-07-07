import { BaseService } from "@/services/base"
import { TagRepository } from "@/repositories/tag"
import type { Tag } from "@/lib/generated/prisma/client"

type TCreate = Parameters<TagRepository["create"]>[0]
type TUpdate = Parameters<TagRepository["update"]>[2]

export class TagService extends BaseService<Tag, TCreate, TUpdate> {
  constructor() {
    super(new TagRepository(), "Tag")
  }
}
