"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { getDemandColumns, type Demand } from "./_columns"
import { DemandForm } from "./ui/demand-form"
import { DemandDeleteDialog } from "./ui/demand-delete-dialog"
import { useDemands, useCreate, useUpdate, useRemove, mutateList } from "./hooks/use-demands"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { fetcher, FetchError } from "@/lib/fetcher"
import { useCrudModal } from "@/hooks/use-crud-modal"
import { hasPermission } from "@/lib/permissions"

export default function DemandsPage() {
  const { data: session } = useSession()
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin as boolean | undefined
  const permissions = (session?.user as any)?.permissions as string[] | undefined
  const ownAnalystId = (session?.user as any)?.analystId as string | null | undefined
  const canViewAllAnalysts = !!isSuperAdmin || hasPermission(permissions, "analyst")
  const restrictedAnalystId = !canViewAllAnalysts && ownAnalystId ? ownAnalystId : undefined

  const { data: demandsResponse, error, isLoading } = useDemands()
  const demands = demandsResponse?.data ?? []
  const { data: analysts } = useSWR<any[]>("/api/analysts", fetcher)
  const { data: clients } = useSWR<any[]>("/api/clients", fetcher)
  const { data: requesters } = useSWR<any[]>("/api/requesters", fetcher)
  const { data: departments } = useSWR<any[]>("/api/departments", fetcher)
  const { data: demandTypes } = useSWR<any[]>("/api/demand-types", fetcher)

  const { trigger: createDemand, isMutating: creating } = useCreate("/api/demands")
  const { trigger: updateDemand, isMutating: updating } = useUpdate("/api/demands")
  const { trigger: removeDemand, isMutating: removing } = useRemove("/api/demands")

  const modal = useCrudModal<Demand>()
  const [deleting, setDeleting] = useState<Demand | null>(null)

  async function handleSubmit(data: Record<string, unknown>) {
    try {
      const totalMinutes = (Number(data.durationHours) || 0) * 60 + (Number(data.durationMinutes) || 0)
      const payload = { ...data, durationMinutes: totalMinutes }
      delete (payload as any).durationHours

      if (modal.editing) {
        await updateDemand({ id: modal.editing.id, ...payload } as any)
        toast.success("Demanda atualizada com sucesso!")
      } else {
        await createDemand(payload as any)
        toast.success("Demanda criada com sucesso!")
      }
      await mutateList("/api/demands")
      modal.close()
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar demanda")
    }
  }

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

  const columns = getDemandColumns({ onEdit: modal.openEdit, onDelete: setDeleting })
  const loading = creating || updating || removing

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
        <Dialog open={modal.open} onOpenChange={modal.onOpenChange}>
          <DialogTrigger render={<Button onClick={modal.openCreate}><Plus className="size-4" /> Nova Demanda</Button>} />
          <DemandForm
            key={modal.sessionId}
            analysts={analysts ?? []}
            clients={clients ?? []}
            requesters={requesters ?? []}
            departments={departments ?? []}
            demandTypes={demandTypes ?? []}
            lockedAnalystId={restrictedAnalystId}
            defaultValues={
              modal.editing
                ? {
                    date: modal.editing.date,
                    analystId: modal.editing.analyst?.id ?? "",
                    clientId: modal.editing.client?.id ?? "",
                    requesterId: modal.editing.requester?.id ?? "",
                    departmentId: modal.editing.department?.id ?? "",
                    demandTypeId: modal.editing.demandType?.id ?? "",
                    name: modal.editing.name,
                    description: modal.editing.description,
                    durationMinutes: modal.editing.durationMinutes,
                    priority: modal.editing.priority,
                    status: modal.editing.status,
                    notes: modal.editing.notes,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            loading={loading}
          />
        </Dialog>
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
        loading={loading}
      />
    </div>
  )
}
