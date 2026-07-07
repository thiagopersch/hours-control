"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { formatDuration, formatDate } from "@/lib/utils"

export type Demand = {
  id: string
  date: string
  name: string
  description: string
  analyst?: { id: string; name: string }
  client?: { id: string; name: string }
  requester?: { id: string; name: string }
  department?: { id: string; name: string }
  demandType?: { id: string; name: string }
  durationMinutes: number
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in_progress" | "resolved" | "closed" | "cancelled"
  notes: string
}

const priorityVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "outline",
  urgent: "destructive",
}

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
}

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "secondary",
  in_progress: "default",
  resolved: "outline",
  closed: "secondary",
  cancelled: "destructive",
}

const statusLabels: Record<string, string> = {
  open: "Aberta",
  in_progress: "Em Andamento",
  resolved: "Resolvida",
  closed: "Fechada",
  cancelled: "Cancelada",
}

type DemandColumnsProps = {
  onEdit: (demand: Demand) => void
  onDelete: (demand: Demand) => void
}

export function getDemandColumns({
  onEdit,
  onDelete,
}: DemandColumnsProps): ColumnDef<Demand>[] {
  return [
    {
      accessorKey: "name",
      header: "Demanda",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorFn: (row) => row.analyst?.name,
      id: "analystName",
      header: "Analista",
    },
    {
      accessorFn: (row) => row.client?.name,
      id: "clientName",
      header: "Cliente",
    },
    {
      accessorKey: "priority",
      header: "Prioridade",
      cell: ({ row }) => (
        <Badge variant={priorityVariants[row.original.priority] || "secondary"}>
          {priorityLabels[row.original.priority] || row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariants[row.original.status] || "secondary"}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "durationMinutes",
      header: "Duração",
      cell: ({ row }) => formatDuration(row.original.durationMinutes),
    },
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => formatDate(row.original.date),
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
