"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Requester, getRequesterColumns } from "./_columns"
import { RequesterForm } from "./ui/requester-form"
import { RequesterDeleteDialog } from "./ui/requester-delete-dialog"
import type { RequesterFormData } from "./schema/requester-schema"
import { useRequesters, useCreate, useUpdate, mutateList } from "@/hooks/use-api"
import { FetchError } from "@/lib/fetcher"
import useSWRMutation from "swr/mutation"
import { apiMutate } from "@/lib/fetcher"
import { useCrudModal } from "@/hooks/use-crud-modal"

export default function RequestersPage() {
  const { data: requesters, error, isLoading } = useRequesters()
  const { trigger: createItem, isMutating: isCreating } = useCreate("/api/requesters")
  const { trigger: updateItem, isMutating: isUpdating } = useUpdate("/api/requesters")
  const { trigger: removeItem, isMutating: isDeleting } = useSWRMutation(
    "/api/requesters",
    (url: string, { arg }: { arg: { id: string } }) =>
      apiMutate(`${url}/${arg.id}`, { method: "DELETE" })
  )
  const modal = useCrudModal<Requester>()
  const [deleting, setDeleting] = useState<Requester | null>(null)

  const mutating = isCreating || isUpdating || isDeleting

  async function handleSubmit(data: RequesterFormData) {
    try {
      if (modal.editing) {
        await updateItem({ ...data, id: modal.editing.id } as any)
        toast.success("Solicitante atualizado com sucesso!")
      } else {
        await createItem(data as any)
        toast.success("Solicitante criado com sucesso!")
      }
      modal.close()
      await mutateList("/api/requesters")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao salvar solicitante")
      }
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeItem({ id: deleting.id })
      toast.success("Solicitante removido com sucesso!")
      setDeleting(null)
      await mutateList("/api/requesters")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao excluir solicitante")
      }
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Spinner className="size-8" /></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  const columns = getRequesterColumns({ onEdit: modal.openEdit, onDelete: setDeleting })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solicitantes</h1>
          <p className="text-muted-foreground">Gerencie os solicitantes dos clientes</p>
        </div>
        <Dialog open={modal.open} onOpenChange={modal.onOpenChange}>
          <DialogTrigger render={<Button onClick={modal.openCreate}><Plus className="size-4" /> Novo Solicitante</Button>} />
          <RequesterForm
            key={modal.sessionId}
            defaultValues={modal.editing ?? undefined}
            onSubmit={handleSubmit}
            loading={mutating}
          />
        </Dialog>
      </div>

      <DataTable columns={columns} data={requesters ?? []} showSearch searchPlaceholder="Buscar por nome, email..." />

      <RequesterDeleteDialog
        requester={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={mutating}
      />
    </div>
  )
}
