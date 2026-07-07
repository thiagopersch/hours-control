"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export type Analyst = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  hourlyRate: number
  team: string
  color: string
  status: "active" | "inactive"
}

type AnalystColumnsProps = {
  onEdit: (analyst: Analyst) => void
  onDelete: (analyst: Analyst) => void
}

export function getAnalystColumns({
  onEdit,
  onDelete,
}: AnalystColumnsProps): ColumnDef<Analyst>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: row.original.color || "#6b7280" }}
          />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Cargo",
    },
    {
      accessorKey: "hourlyRate",
      header: "Valor Hora",
      cell: ({ row }) => formatCurrency(row.original.hourlyRate),
    },
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
