"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Analyst, getAnalystColumns } from "./_columns"
import { AnalystForm } from "./ui/analyst-form"
import { AnalystDeleteDialog } from "./ui/analyst-delete-dialog"
import type { AnalystFormData } from "./schema/analyst-schema"
import { useAnalysts, useCreate, useUpdate, useRemove, mutateList } from "./hooks/use-analysts"
import { FetchError } from "@/lib/fetcher"

export default function AnalystsPage() {
  const { data: analysts, error, isLoading } = useAnalysts()
  const { trigger: createAnalyst, isMutating: isCreating } = useCreate("/api/analysts")
  const { trigger: updateAnalyst, isMutating: isUpdating } = useUpdate("/api/analysts")
  const { trigger: removeAnalyst, isMutating: isDeleting } = useRemove("/api/analysts")
  const [editing, setEditing] = useState<Analyst | null>(null)
  const [deleting, setDeleting] = useState<Analyst | null>(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: AnalystFormData) {
    try {
      if (editing) {
        await updateAnalyst({ ...data, id: editing.id })
        toast.success("Analista atualizado com sucesso!")
      } else {
        await createAnalyst(data)
        toast.success("Analista criado com sucesso!")
      }
      mutateList("/api/analysts")
      setOpen(false)
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar")
    }
  }

  function handleEdit(analyst: Analyst) {
    setEditing(analyst)
    setOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeAnalyst({ id: deleting.id })
      mutateList("/api/analysts")
      toast.success("Analista removido com sucesso!")
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao excluir")
    }
  }

  const columns = getAnalystColumns({ onEdit: handleEdit, onDelete: setDeleting })

  if (isLoading) return <div className="flex items-center justify-center py-20"><span className="text-muted-foreground">Carregando...</span></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analistas</h1>
          <p className="text-muted-foreground">Gerencie os analistas cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}>
          <DialogTrigger render={<Button><Plus className="size-4" /> Novo Analista</Button>} />
          <AnalystForm
            key={editing?.id ?? "new"}
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            loading={isCreating || isUpdating}
          />
        </Dialog>
      </div>

      <DataTable columns={columns} data={analysts ?? []} showSearch searchPlaceholder="Buscar por nome, email..." />

      <AnalystDeleteDialog
        analyst={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  )
}
