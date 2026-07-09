import { z } from "zod"
import { nameSchema, emailSchema, passwordSchema } from "@/lib/validators"

export function getUserSchema(isEditing: boolean) {
  return z.object({
    name: nameSchema(),
    email: emailSchema(true),
    password: passwordSchema(!isEditing),
    status: z.enum(["active", "inactive"], { message: "Status é obrigatório" }),
    mustChangePassword: z.boolean().optional(),
    roleIds: z.array(z.string()).min(1, "Selecione ao menos um perfil"),
  })
}

export const userSchema = getUserSchema(false)

export type UserFormData = z.infer<typeof userSchema>
