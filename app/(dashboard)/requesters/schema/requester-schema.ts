import { z } from "zod"
import { nameSchema, emailSchema, phoneSchema } from "@/lib/validators"

export const requesterSchema = z.object({
  name: nameSchema(),
  email: emailSchema(true),
  phone: phoneSchema(false),
  status: z.enum(["active", "inactive"], { message: "Status é obrigatório" }),
})

export type RequesterFormData = z.infer<typeof requesterSchema>
