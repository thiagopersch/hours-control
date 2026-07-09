import { z } from "zod"
import { nameSchema } from "@/lib/validators"

export const demandTypeSchema = z.object({
  name: nameSchema(),
  description: z.string().optional(),
  color: z.string().optional(),
})

export type DemandTypeFormData = z.infer<typeof demandTypeSchema>
