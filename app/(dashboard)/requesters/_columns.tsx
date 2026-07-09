"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Pencil, Trash2 } from "lucide-react"

const statusColors: Record<string, string> = {
  active: "#22c55e",
  inactive: "#6b7280",
}

export type Requester = {
  id: string
  name: string
  email: string
  phone: string
  status: "active" | "inactive"
}

type RequesterColumnsProps = {
  onEdit: (requester: Requester) => void
  onDelete: (requester: Requester) => void
}

export function getRequesterColumns({
  onEdit,
  onDelete,
}: RequesterColumnsProps): ColumnDef<Requester>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Telefone" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          color={statusColors[row.original.status]}
          label={row.original.status === "active" ? "Ativo" : "Inativo"}
        />
      ),
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
