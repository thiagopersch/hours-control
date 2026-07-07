"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export type Contract = {
  id: string
  clientId: string
  clientName: string
  contractedHours: number
  hourlyRate: number
  startDate: string
  endDate: string
  notes: string
  status: "active" | "inactive" | "completed" | "cancelled"
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
      accessorKey: "clientName",
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const variantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
          active: "default",
          inactive: "secondary",
          completed: "outline",
          cancelled: "destructive",
        }
        const labelMap: Record<string, string> = {
          active: "Ativo",
          inactive: "Inativo",
          completed: "Concluído",
          cancelled: "Cancelado",
        }
        return (
          <Badge variant={variantMap[row.original.status] || "secondary"}>
            {labelMap[row.original.status] || row.original.status}
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
