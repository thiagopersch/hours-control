import { z } from "zod"

export const analystSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  hourlyRate: z.number().min(0, "Valor não pode ser negativo"),
  team: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type AnalystFormData = z.infer<typeof analystSchema>
