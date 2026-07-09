import { z } from "zod"
import { nameSchema } from "@/lib/validators"

export const departmentSchema = z.object({
  name: nameSchema(),
  description: z.string().optional(),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>
