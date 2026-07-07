import { z } from "zod"

export const departmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>
