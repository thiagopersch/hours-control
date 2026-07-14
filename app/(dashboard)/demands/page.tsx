"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { getDemandColumns, type Demand } from "./_columns"
import { DemandDeleteDialog } from "./ui/demand-delete-dialog"
import { useDemands, useRemove, mutateList } from "./hooks/use-demands"
import { FetchError } from "@/lib/fetcher"
import { hasPermission } from "@/lib/permissions"

export default function DemandsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin as boolean | undefined
  const permissions = (session?.user as any)?.permissions as
    | { resource: string; action: string; scope: string }[]
    | undefined
  const canCreate = !!isSuperAdmin || hasPermission(permissions, "demand", "create")
  const canUpdate = !!isSuperAdmin || hasPermission(permissions, "demand", "update")
  const canDelete = !!isSuperAdmin || hasPermission(permissions, "demand", "delete")

  const { data: demandsResponse, error, isLoading } = useDemands()
  const demands = demandsResponse?.data ?? []

  const { trigger: removeDemand, isMutating: removing } = useRemove("/api/demands")

  const [deleting, setDeleting] = useState<Demand | null>(null)

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeDemand({ id: deleting.id } as any)
      await mutateList("/api/demands")
      toast.success("Demanda removida com sucesso!")
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao remover demanda")
    }
  }

  const columns = getDemandColumns({
    onEdit: (demand) => router.push(`/demands/${demand.id}`),
    onDelete: setDeleting,
    canUpdate,
    canDelete,
  })

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Erro ao carregar demandas</AlertTitle>
        <AlertDescription>{error instanceof FetchError ? error.message : "Tente novamente mais tarde."}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demandas</h1>
          <p className="text-muted-foreground">Gerencie as demandas e apontamentos de horas</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/demands/new")}>
            <Plus className="size-4" /> Nova Demanda
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <DataTable columns={columns} data={demands} showSearch searchPlaceholder="Buscar por nome, cliente, analista..." />
      )}

      <DemandDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => { if (!v) setDeleting(null) }}
        demandName={deleting?.name}
        onConfirm={handleDelete}
        loading={removing}
      />
    </div>
  )
}
