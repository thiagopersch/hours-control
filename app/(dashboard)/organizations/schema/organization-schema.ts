import { z } from "zod"
import { nameSchema } from "@/lib/validators"

export const organizationSchema = z.object({
  name: nameSchema(),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen"),
  document: z.string().optional().or(z.literal("")),
  plan: z.enum(["free", "pro", "enterprise"], { message: "Plano é obrigatório" }),
  status: z.enum(["active", "inactive"], { message: "Status é obrigatório" }),
})

export type OrganizationFormData = z.infer<typeof organizationSchema>
