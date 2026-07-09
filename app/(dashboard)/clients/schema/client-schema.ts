import { z } from "zod"
import { nameSchema, emailSchema, phoneSchema, documentSchema, optionalNameSchema } from "@/lib/validators"

export const clientSchema = z.object({
  name: nameSchema(),
  legalName: optionalNameSchema("Razão Social"),
  document: documentSchema(false),
  email: emailSchema(false),
  phone: phoneSchema(false),
  responsible: optionalNameSchema("Responsável"),
  color: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"], { message: "Status é obrigatório" }),
})

export type ClientFormData = z.infer<typeof clientSchema>
