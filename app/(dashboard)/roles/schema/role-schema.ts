import { z } from "zod"

export const permissionScopeEnum = z.enum([
  "NONE",
  "OWN",
  "TEAM",
  "DEPARTMENT",
  "COMPANY",
  "ALL",
])

export type PermissionScopeValue = z.infer<typeof permissionScopeEnum>

export const roleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  permissionScopes: z
    .array(z.object({ permissionId: z.string(), scope: permissionScopeEnum }))
    .optional(),
})

export type RoleFormData = z.infer<typeof roleSchema>
