"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Department, getDepartmentColumns } from "./_columns"
import { DepartmentForm } from "./ui/department-form"
import { DepartmentDeleteDialog } from "./ui/department-delete-dialog"
import type { DepartmentFormData } from "./schema/department-schema"
import { useDepartments, useCreate, useUpdate, mutateList } from "@/hooks/use-api"
import { FetchError } from "@/lib/fetcher"
import useSWRMutation from "swr/mutation"
import { apiMutate } from "@/lib/fetcher"

export default function DepartmentsPage() {
  const { data: departments, error, isLoading } = useDepartments()
  const { trigger: createItem, isMutating: isCreating } = useCreate("/api/departments")
  const { trigger: updateItem, isMutating: isUpdating } = useUpdate("/api/departments")
  const { trigger: removeItem, isMutating: isDeleting } = useSWRMutation(
    "/api/departments",
    (url: string, { arg }: { arg: { id: string } }) =>
      apiMutate(`${url}/${arg.id}`, { method: "DELETE" })
  )
  const [editing, setEditing] = useState<Department | null>(null)
  const [deleting, setDeleting] = useState<Department | null>(null)
  const [open, setOpen] = useState(false)

  const mutating = isCreating || isUpdating || isDeleting

  async function handleSubmit(data: DepartmentFormData) {
    try {
      if (editing) {
        await updateItem({ ...data, id: editing.id } as any)
        toast.success("Setor atualizado com sucesso!")
      } else {
        await createItem(data as any)
        toast.success("Setor criado com sucesso!")
      }
      setOpen(false)
      setEditing(null)
      await mutateList("/api/departments")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao salvar setor")
      }
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeItem({ id: deleting.id })
      toast.success("Setor removido com sucesso!")
      setDeleting(null)
      await mutateList("/api/departments")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao excluir setor")
      }
    }
  }

  function handleEdit(dept: Department) {
    setEditing(dept)
    setOpen(true)
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Spinner className="size-8" /></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  const columns = getDepartmentColumns({ onEdit: handleEdit, onDelete: setDeleting })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Setores</h1>
          <p className="text-muted-foreground">Gerencie os setores dos clientes</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}>
          <DialogTrigger render={<Button><Plus className="size-4" /> Novo Setor</Button>} />
          <DepartmentForm
            key={editing?.id ?? "new"}
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            loading={mutating}
          />
        </Dialog>
      </div>

      <DataTable columns={columns} data={departments ?? []} showSearch searchPlaceholder="Buscar por nome..." />

      <DepartmentDeleteDialog
        department={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={mutating}
      />
    </div>
  )
}
