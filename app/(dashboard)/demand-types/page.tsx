"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { DemandType, getDemandTypeColumns } from "./_columns"
import { DemandTypeForm } from "./ui/demand-type-form"
import { DemandTypeDeleteDialog } from "./ui/demand-type-delete-dialog"
import type { DemandTypeFormData } from "./schema/demand-type-schema"
import { useDemandTypes, useCreate, useUpdate, mutateList } from "@/hooks/use-api"
import { FetchError } from "@/lib/fetcher"
import useSWRMutation from "swr/mutation"
import { apiMutate } from "@/lib/fetcher"
import { useCrudModal } from "@/hooks/use-crud-modal"

export default function DemandTypesPage() {
  const { data: types, error, isLoading } = useDemandTypes()
  const { trigger: createItem, isMutating: isCreating } = useCreate("/api/demand-types")
  const { trigger: updateItem, isMutating: isUpdating } = useUpdate("/api/demand-types")
  const { trigger: removeItem, isMutating: isDeleting } = useSWRMutation(
    "/api/demand-types",
    (url: string, { arg }: { arg: { id: string } }) =>
      apiMutate(`${url}/${arg.id}`, { method: "DELETE" })
  )
  const modal = useCrudModal<DemandType>()
  const [deleting, setDeleting] = useState<DemandType | null>(null)

  const mutating = isCreating || isUpdating || isDeleting

  async function handleSubmit(data: DemandTypeFormData) {
    try {
      if (modal.editing) {
        await updateItem({ ...data, id: modal.editing.id } as any)
        toast.success("Tipo de demanda atualizado com sucesso!")
      } else {
        await createItem(data as any)
        toast.success("Tipo de demanda criado com sucesso!")
      }
      modal.close()
      await mutateList("/api/demand-types")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao salvar tipo de demanda")
      }
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeItem({ id: deleting.id })
      toast.success("Tipo de demanda removido com sucesso!")
      setDeleting(null)
      await mutateList("/api/demand-types")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao excluir tipo de demanda")
      }
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Spinner className="size-8" /></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  const columns = getDemandTypeColumns({ onEdit: modal.openEdit, onDelete: setDeleting })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tipos de Demanda</h1>
          <p className="text-muted-foreground">Gerencie os tipos de demanda</p>
        </div>
        <Dialog open={modal.open} onOpenChange={modal.onOpenChange}>
          <DialogTrigger render={<Button onClick={modal.openCreate}><Plus className="size-4" /> Novo Tipo</Button>} />
          <DemandTypeForm
            key={modal.sessionId}
            defaultValues={modal.editing ?? undefined}
            onSubmit={handleSubmit}
            loading={mutating}
          />
        </Dialog>
      </div>

      <DataTable columns={columns} data={types ?? []} showSearch searchPlaceholder="Buscar por nome..." />

      <DemandTypeDeleteDialog
        demandType={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={mutating}
      />
    </div>
  )
}
