"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export type Role = {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissionsCount: number
}

type RoleColumnsProps = {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

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
      accessorKey: "isSystem",
      header: "Sistema",
      cell: ({ row }) =>
        row.original.isSystem ? (
          <Badge variant="default">Sistema</Badge>
        ) : (
          <Badge variant="outline">Customizado</Badge>
        ),
    },
    {
      accessorKey: "permissionsCount",
      header: "Permissões",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.permissionsCount}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (!row.original.isSystem) onEdit(row.original);
            }}
            disabled={row.original.isSystem}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (!row.original.isSystem) onDelete(row.original);
            }}
            disabled={row.original.isSystem}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]
}
