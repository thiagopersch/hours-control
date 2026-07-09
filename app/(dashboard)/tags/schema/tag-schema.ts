import { z } from "zod"
import { nameSchema } from "@/lib/validators"

export const tagSchema = z.object({
  name: nameSchema(),
  color: z.string().optional(),
})

export type TagFormData = z.infer<typeof tagSchema>
