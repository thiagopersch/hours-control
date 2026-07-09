"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Pencil } from "lucide-react"

export type Organization = {
  id: string
  name: string
  slug: string
  document?: string
  plan: "free" | "pro" | "enterprise"
  status: "active" | "inactive"
  _count?: { users: number }
}

const statusColors: Record<string, string> = {
  active: "#22c55e",
  inactive: "#6b7280",
}

const planLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
}

type OrganizationColumnsProps = {
  onEdit: (organization: Organization) => void
}

export function getOrganizationColumns({
  onEdit,
}: OrganizationColumnsProps): ColumnDef<Organization>[] {
  return [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "slug", header: "Slug" },
    {
      accessorKey: "plan",
      header: "Plano",
      cell: ({ row }) => planLabels[row.original.plan] ?? row.original.plan,
    },
    {
      id: "usersCount",
      accessorFn: (row) => row._count?.users ?? 0,
      header: "Usuários",
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
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(row.original)}>
            <Pencil className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
}
