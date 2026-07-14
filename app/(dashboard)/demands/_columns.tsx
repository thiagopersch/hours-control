"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
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
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD"
  notes: string
}

const priorityVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "outline",
  URGENT: "destructive",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const statusColors: Record<string, string> = {
  PENDING: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  ON_HOLD: "#f59e0b",
  CANCELLED: "#ef4444",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  ON_HOLD: "Em Espera",
  CANCELLED: "Cancelada",
}

type DemandColumnsProps = {
  onEdit: (demand: Demand) => void
  onDelete: (demand: Demand) => void
  canUpdate?: boolean
  canDelete?: boolean
}

export function getDemandColumns({
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
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
        <StatusBadge
          color={statusColors[row.original.status] ?? "#6b7280"}
          label={statusLabels[row.original.status] || row.original.status}
        />
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
          {canUpdate && (
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(row.original)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ]
}
