"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Pencil, Trash2, Star } from "lucide-react"

const statusColors: Record<string, string> = {
  active: "#22c55e",
  inactive: "#6b7280",
}

export type Client = {
  id: string
  name: string
  legalName?: string
  document?: string
  email?: string
  phone?: string
  responsible?: string
  color: string
  notes?: string
  status: "active" | "inactive"
  favorite: boolean
  createdAt: string
}

type ClientColumnsProps = {
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onToggleFavorite: (client: Client) => void
}

export function getClientColumns({
  onEdit,
  onDelete,
  onToggleFavorite,
}: ClientColumnsProps): ColumnDef<Client>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => { onToggleFavorite(row.original) }}
          >
            <Star
              className={`size-4 ${
                row.original.favorite
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
          <div
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: row.original.color || "#6b7280" }}
          />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "document",
      header: "Documento",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]
}
