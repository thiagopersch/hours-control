import { z } from "zod"

export const contractSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  contractedHours: z.number().int("Horas deve ser um número inteiro").min(1, "Horas deve ser maior que 0"),
  hourlyRate: z.number().min(0, "Valor não pode ser negativo"),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "CANCELLED"]),
})

export type ContractFormData = z.infer<typeof contractSchema>
