import { z } from "zod"

export const demandSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  analystId: z.string().min(1, "Analista é obrigatório"),
  clientId: z.string().min(1, "Cliente é obrigatório"),
  requesterId: z.string().optional(),
  departmentId: z.string().optional(),
  demandTypeId: z.string().optional(),
  name: z.string().min(1, "Nome da demanda é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  durationHours: z.number().min(0).optional(),
  durationMinutes: z.number().min(0).max(59).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed", "cancelled"]),
  notes: z.string().optional(),
})

export type DemandFormData = z.infer<typeof demandSchema>
