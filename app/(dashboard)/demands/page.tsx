"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import type { Demand } from "./_columns"
import { getDemandColumns } from "./_columns"
import { DemandForm } from "./ui/demand-form"
import { DemandDeleteDialog } from "./ui/demand-delete-dialog"
import type { DemandFormData } from "./schema/demand-schema"
import { useDemands, useCreate, useUpdate, useRemove, mutateList } from "./hooks/use-demands"
import useSWR from "swr"
import { fetcher, FetchError } from "@/lib/fetcher"

export default function DemandsPage() {
  const { data: demands, error, isLoading } = useDemands()
  const { data: analysts } = useSWR<any[]>("/api/analysts", fetcher)
  const { data: clients } = useSWR<any[]>("/api/clients", fetcher)
  const { data: requesters } = useSWR<any[]>("/api/requesters", fetcher)
  const { data: departments } = useSWR<any[]>("/api/departments", fetcher)
  const { data: demandTypes } = useSWR<any[]>("/api/demand-types", fetcher)

  const { trigger: createDemand, isMutating: creating } = useCreate("/api/demands")
  const { trigger: updateDemand, isMutating: updating } = useUpdate("/api/demands")
  const { trigger: removeDemand, isMutating: removing } = useRemove("/api/demands")

  const [editing, setEditing] = useState<Demand | null>(null)
  const [deleting, setDeleting] = useState<Demand | null>(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: Record<string, unknown>) {
    try {
      const totalMinutes = (Number(data.durationHours) || 0) * 60 + (Number(data.durationMinutes) || 0)
      const payload = { ...data, durationMinutes: totalMinutes }
      delete (payload as any).durationHours

      if (editing) {
        await updateDemand({ id: editing.id, ...payload } as any)
        toast.success("Demanda atualizada com sucesso!")
      } else {
        await createDemand(payload as any)
        toast.success("Demanda criada com sucesso!")
      }
      await mutateList("/api/demands")
      setOpen(false)
      setEditing(null)
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

  function handleEdit(demand: Demand) {
    setEditing(demand)
    setOpen(true)
  }

  const columns = getDemandColumns({ onEdit: handleEdit, onDelete: setDeleting })
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
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}>
          <DialogTrigger render={<Button><Plus className="size-4" /> Nova Demanda</Button>} />
          <DemandForm
            key={editing?.id ?? "new"}
            analysts={analysts ?? []}
            clients={clients ?? []}
            requesters={requesters ?? []}
            departments={departments ?? []}
            demandTypes={demandTypes ?? []}
            defaultValues={
              editing
                ? {
                    date: editing.date,
                    analystId: editing.analyst?.id ?? "",
                    clientId: editing.client?.id ?? "",
                    requesterId: editing.requester?.id ?? "",
                    departmentId: editing.department?.id ?? "",
                    demandTypeId: editing.demandType?.id ?? "",
                    name: editing.name,
                    description: editing.description,
                    durationMinutes: editing.durationMinutes,
                    priority: editing.priority,
                    status: editing.status,
                    notes: editing.notes,
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
        <DataTable columns={columns} data={demands ?? []} showSearch searchPlaceholder="Buscar por nome, cliente, analista..." />
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
