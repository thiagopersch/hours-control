"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Client, getClientColumns } from "./_columns"
import { ClientForm } from "./ui/client-form"
import { ClientDeleteDialog } from "./ui/client-delete-dialog"
import type { ClientFormData } from "./schema/client-schema"
import { useClients, useCreate, useUpdate, useRemove, mutateList } from "./hooks/use-clients"
import { FetchError, apiMutate } from "@/lib/fetcher"

export default function ClientsPage() {
  const { data: clients, error, isLoading } = useClients()
  const { trigger: createClient, isMutating: isCreating } = useCreate("/api/clients")
  const { trigger: updateClient, isMutating: isUpdating } = useUpdate("/api/clients")
  const { trigger: removeClient, isMutating: isDeleting } = useRemove("/api/clients")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: ClientFormData) {
    try {
      if (editingClient) {
        await updateClient({ ...data, id: editingClient.id })
        toast.success("Cliente atualizado com sucesso!")
      } else {
        await createClient(data)
        toast.success("Cliente criado com sucesso!")
      }
      mutateList("/api/clients")
      setOpen(false)
      setEditingClient(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar")
    }
  }

  function handleEdit(client: Client) {
    setEditingClient(client)
    setOpen(true)
  }

  async function handleDelete() {
    if (!deletingClient) return
    try {
      await removeClient({ id: deletingClient.id })
      mutateList("/api/clients")
      toast.success("Cliente removido com sucesso!")
      setDeletingClient(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao excluir")
    }
  }

  async function handleToggleFavorite(client: Client) {
    try {
      await apiMutate(`/api/clients/${client.id}`, {
        method: "PATCH",
        body: JSON.stringify({ favorite: !client.favorite }),
      })
      mutateList("/api/clients")
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao atualizar favorito")
    }
  }

  const columns = getClientColumns({
    onEdit: handleEdit,
    onDelete: setDeletingClient,
    onToggleFavorite: (client) => { void handleToggleFavorite(client) },
  })

  if (isLoading) return <div className="flex items-center justify-center py-20"><span className="text-muted-foreground">Carregando...</span></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingClient(null) }}>
          <DialogTrigger render={<Button><Plus className="size-4" /> Novo Cliente</Button>} />
          <ClientForm
            key={editingClient?.id ?? "new"}
            defaultValues={editingClient ?? undefined}
            onSubmit={handleSubmit}
            loading={isCreating || isUpdating}
          />
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={clients ?? []}
        showSearch
        searchPlaceholder="Buscar por nome, documento, email..."
      />

      <ClientDeleteDialog
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  )
}
