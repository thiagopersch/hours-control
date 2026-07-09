"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Pencil, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export type Contract = {
  id: string
  clientId: string
  client: { id: string; name: string }
  contractedHours: number
  hourlyRate: number
  startDate: string
  endDate: string
  notes: string
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CANCELLED"
  balanceMinutes?: number
}

function formatBalance(minutes: number): string {
  const sign = minutes < 0 ? "-" : ""
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function formatDueDateLabel(days: number): string {
  return `${days} ${days > 1 ? "dias" : "dia"}`
}

function getDueDateStatus(endDate: string): { label: string; className: string } {
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 3) {
    return { label: formatDueDateLabel(days), className: "bg-red-500/15 text-red-600 dark:text-red-400" }
  }
  if (days <= 7) {
    return { label: formatDueDateLabel(days), className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" }
  }
  return { label: formatDueDateLabel(days), className: "bg-green-500/15 text-green-600 dark:text-green-400" }
}

type ContractColumnsProps = {
  onEdit: (contract: Contract) => void
  onDelete: (contract: Contract) => void
}

export function getContractColumns({
  onEdit,
  onDelete,
}: ContractColumnsProps): ColumnDef<Contract>[] {
  return [
    {
      id: "client",
      accessorFn: (row) => row.client?.name ?? "-",
      header: "Cliente",
    },
    {
      accessorKey: "contractedHours",
      header: "Horas Contratadas",
      cell: ({ row }) => `${row.original.contractedHours}h`,
    },
    {
      accessorKey: "hourlyRate",
      header: "Valor Hora",
      cell: ({ row }) => formatCurrency(row.original.hourlyRate),
    },
    {
      accessorKey: "startDate",
      header: "Início",
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: "Término",
      cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
      id: "balanceMinutes",
      accessorFn: (row) => row.balanceMinutes ?? 0,
      header: "Saldo de Horas",
      cell: ({ row }) => {
        const balance = row.original.balanceMinutes ?? 0
        return (
          <span className={balance < 0 ? "text-destructive font-medium" : "font-medium"}>
            {formatBalance(balance)}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const colorMap: Record<string, string> = {
          ACTIVE: "#22c55e",
          SUSPENDED: "#eab308",
          EXPIRED: "#6b7280",
          CANCELLED: "#ef4444",
        }
        const labelMap: Record<string, string> = {
          ACTIVE: "Ativo",
          SUSPENDED: "Suspenso",
          EXPIRED: "Expirado",
          CANCELLED: "Cancelado",
        }
        return (
          <StatusBadge
            color={colorMap[row.original.status] ?? "#6b7280"}
            label={labelMap[row.original.status] || row.original.status}
          />
        )
      },
    },
    {
      id: "dueStatus",
      header: "Vencimento",
      cell: ({ row }) => {
        const { label, className } = getDueDateStatus(row.original.endDate)
        return (
          <Badge variant="outline" className={className}>
            {label}
          </Badge>
        )
      },
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
