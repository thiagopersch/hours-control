"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export type Department = {
  id: string
  name: string
  description: string
}

type DepartmentColumnsProps = {
  onEdit: (dept: Department) => void
  onDelete: (dept: Department) => void
}

export function getDepartmentColumns({
  onEdit,
  onDelete,
}: DepartmentColumnsProps): ColumnDef<Department>[] {
  return [
    { accessorKey: "name", header: "Nome" },
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
