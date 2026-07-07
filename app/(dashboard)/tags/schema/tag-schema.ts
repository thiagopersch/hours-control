import { z } from "zod"

export const tagSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  color: z.string().optional(),
})

export type TagFormData = z.infer<typeof tagSchema>
