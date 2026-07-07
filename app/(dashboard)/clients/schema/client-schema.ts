import { z } from "zod"

export const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  legalName: z.string().optional(),
  document: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  responsible: z.string().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type ClientFormData = z.infer<typeof clientSchema>
