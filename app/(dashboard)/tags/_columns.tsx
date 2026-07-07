"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export type Tag = {
  id: string
  name: string
  color: string
}

type TagColumnsProps = {
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
}

export function getTagColumns({
  onEdit,
  onDelete,
}: TagColumnsProps): ColumnDef<Tag>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: row.original.color || "#6b7280" }}
          />
          <span className="font-medium">{row.original.name}</span>
        </div>
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
