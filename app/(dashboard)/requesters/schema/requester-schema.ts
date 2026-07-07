import { z } from "zod"

export const requesterSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

export type RequesterFormData = z.infer<typeof requesterSchema>
