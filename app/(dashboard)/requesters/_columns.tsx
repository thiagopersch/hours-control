"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export type Requester = {
  id: string
  name: string
  email: string
  phone: string
  clientId: string
  clientName: string
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
    { accessorKey: "clientName", header: "Cliente" },
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
