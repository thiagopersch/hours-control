"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Eye, Plus, Pencil, Trash2 } from "lucide-react"
import { moduleLabel } from "@/lib/module-labels"

export type Role = {
  id: string
  name: string
  description: string
  isSystem: boolean
  rolePermissions: { permission: { resource: string; action: string } }[]
  _count: { userRoles: number }
}

type RoleColumnsProps = {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

const actionIcons: { action: string; Icon: typeof Eye; label: string }[] = [
  { action: "read", Icon: Eye, label: "Visualizar" },
  { action: "create", Icon: Plus, label: "Criar" },
  { action: "update", Icon: Pencil, label: "Editar" },
  { action: "delete", Icon: Trash2, label: "Excluir" },
]

export function getRoleColumns({
  onEdit,
  onDelete,
}: RoleColumnsProps): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      id: "permissions",
      header: "Permissões",
      cell: ({ row }) => {
        const permissions = row.original.rolePermissions ?? []
        return (
          <div className="flex items-center gap-2">
            {actionIcons.map(({ action, Icon, label }) => {
              const modules = permissions
                .filter((rp) => rp.permission.action === action)
                .map((rp) => moduleLabel(rp.permission.resource))
              const hasAny = modules.length > 0
              return (
                <Tooltip key={action}>
                  <TooltipTrigger
                    render={<span className={hasAny ? "text-foreground" : "text-muted-foreground/30"} />}
                  >
                    <Icon className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasAny ? `${label}: ${modules.join(", ")}` : `${label}: nenhum módulo`}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const hasUsers = row.original._count?.userRoles > 0
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            {hasUsers ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-not-allowed opacity-50"
                      onClick={(e: React.MouseEvent) => e.preventDefault()}
                    />
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>Existe usuários vinculados a este perfil</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="icon-sm" onClick={() => onDelete(row.original)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}
