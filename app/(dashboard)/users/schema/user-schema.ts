import { z } from "zod"

export const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  roleIds: z.array(z.string()).optional(),
})

export type UserFormData = z.infer<typeof userSchema>
