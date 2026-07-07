"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export type DemandType = {
  id: string
  name: string
  description: string
  color: string
}

type DemandTypeColumnsProps = {
  onEdit: (dt: DemandType) => void
  onDelete: (dt: DemandType) => void
}

export function getDemandTypeColumns({
  onEdit,
  onDelete,
}: DemandTypeColumnsProps): ColumnDef<DemandType>[] {
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
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => row.original.description || "-",
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
