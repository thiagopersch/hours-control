import { z } from "zod"
import { nameSchema } from "@/lib/validators"

export const demandSchema = z
  .object({
    date: z.string().min(1, "Data é obrigatória"),
    analystId: z.string().min(1, "Analista é obrigatório"),
    clientId: z.string().min(1, "Cliente é obrigatório"),
    requesterId: z.string().min(1, "Solicitante é obrigatório"),
    departmentId: z.string().min(1, "Setor é obrigatório"),
    demandTypeId: z.string().min(1, "Tipo de demanda é obrigatório"),
    name: nameSchema("Nome da demanda"),
    description: z.string().min(1, "Descrição é obrigatória"),
    durationHours: z.number().min(0).optional(),
    durationMinutes: z.number().min(0).max(59).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], { message: "Prioridade é obrigatória" }),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "ON_HOLD"], { message: "Status é obrigatório" }),
    notes: z.string().optional(),
  })
  .refine((data) => (data.durationHours ?? 0) * 60 + (data.durationMinutes ?? 0) > 0, {
    message: "Duração é obrigatória",
    path: ["durationHours"],
  })

export type DemandFormData = z.infer<typeof demandSchema>
