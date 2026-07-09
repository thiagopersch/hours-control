import { z } from "zod"
import { nameSchema, emailSchema, phoneSchema } from "@/lib/validators"

export const MAX_ANALYST_LEVEL = 5

export const analystSchema = z.object({
  name: nameSchema(),
  email: emailSchema(false),
  phone: phoneSchema(false),
  role: z.string().optional(),
  hourlyRate: z.number().min(0.01, "Valor hora é obrigatório"),
  team: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  level: z.number().int().min(1).max(MAX_ANALYST_LEVEL, `Nível deve ser entre 1 e ${MAX_ANALYST_LEVEL}`),
  status: z.enum(["active", "inactive"], { message: "Status é obrigatório" }),
})

export type AnalystFormData = z.infer<typeof analystSchema>
