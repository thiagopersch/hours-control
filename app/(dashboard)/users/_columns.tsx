"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export type User = {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
  userRoles: { role: { id: string; name: string } }[]
  lastLogin: string | null
}

type UserColumnsProps = {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function getUserColumns({
  onEdit,
  onDelete,
}: UserColumnsProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
          {row.original.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "roles",
      header: "Perfis",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.userRoles?.length > 0 ? (
            row.original.userRoles.map((ur, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {ur.role.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Último Login",
      cell: ({ row }) =>
        row.original.lastLogin ? formatDateTime(row.original.lastLogin) : "-",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(row.original)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(row.original)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]
}
