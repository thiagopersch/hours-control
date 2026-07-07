import { z } from "zod"

export const demandTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().optional(),
})

export type DemandTypeFormData = z.infer<typeof demandTypeSchema>
