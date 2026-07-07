"use client"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { FetchError, apiMutate } from "@/lib/fetcher"
import { Tag, getTagColumns } from "./_columns"
import { TagForm } from "./ui/tag-form"
import type { TagFormData } from "./schema/tag-schema"
import { TagDeleteDialog } from "./ui/tag-delete-dialog"
import { useTags, useCreate, useUpdate, mutateList } from "./hooks/use-tags"

export default function TagsPage() {
  const { data: tags, error, isLoading } = useTags()
  const { trigger: createItem, isMutating: isCreating } = useCreate("/api/tags")
  const { trigger: updateItem, isMutating: isUpdating } = useUpdate("/api/tags")
  const { trigger: removeItem, isMutating: isDeleting } = useSWRMutation(
    "/api/tags",
    (url: string, { arg }: { arg: { id: string } }) =>
      apiMutate(`${url}/${arg.id}`, { method: "DELETE" })
  )
  const [editing, setEditing] = useState<Tag | null>(null)
  const [deleting, setDeleting] = useState<Tag | null>(null)
  const [open, setOpen] = useState(false)

  const mutating = isCreating || isUpdating || isDeleting

  async function handleSubmit(data: TagFormData) {
    try {
      if (editing) {
        await updateItem({ ...data, id: editing.id } as any)
        toast.success("Tag atualizada com sucesso!")
      } else {
        await createItem(data as any)
        toast.success("Tag criada com sucesso!")
      }
      setOpen(false)
      setEditing(null)
      await mutateList("/api/tags")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao salvar tag")
      }
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeItem({ id: deleting.id })
      toast.success("Tag removida com sucesso!")
      setDeleting(null)
      await mutateList("/api/tags")
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message)
      } else {
        toast.error("Erro ao excluir tag")
      }
    }
  }

  function handleEdit(tag: Tag) {
    setEditing(tag)
    setOpen(true)
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Spinner className="size-8" /></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  const columns = getTagColumns({ onEdit: handleEdit, onDelete: setDeleting })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">Gerencie as tags para classificação</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}>
          <DialogTrigger render={<Button><Plus className="size-4" /> Nova Tag</Button>} />
          <TagForm
            key={editing?.id ?? "new"}
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            loading={mutating}
          />
        </Dialog>
      </div>

      <DataTable columns={columns} data={tags ?? []} showSearch searchPlaceholder="Buscar por nome..." />

      <TagDeleteDialog
        tag={deleting ? { id: deleting.id, name: deleting.name } : null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  )
}
