import { z } from "zod"

export const MAX_ANALYST_LEVEL = 5

export const analystSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  hourlyRate: z.number().min(0, "Valor não pode ser negativo"),
  team: z.string().optional(),
  color: z.string().optional(),
  level: z.number().int().min(1).max(MAX_ANALYST_LEVEL),
  status: z.enum(["active", "inactive"]),
})

export type AnalystFormData = z.infer<typeof analystSchema>
