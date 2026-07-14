"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
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
import { useCrudModal } from "@/hooks/use-crud-modal"
import { hasPermission } from "@/lib/permissions"

export default function ClientsPage() {
  const { data: session } = useSession()
  const isSuperAdmin = !!(session?.user as any)?.isSuperAdmin
  const permissions = (session?.user as any)?.permissions
  const canFavorite = isSuperAdmin || hasPermission(permissions, "client", "favorite")
  const canUpdate = isSuperAdmin || hasPermission(permissions, "client", "update")
  const canDelete = isSuperAdmin || hasPermission(permissions, "client", "delete")

  const { data: clients, error, isLoading } = useClients()
  const { trigger: createClient, isMutating: isCreating } = useCreate("/api/clients")
  const { trigger: updateClient, isMutating: isUpdating } = useUpdate("/api/clients")
  const { trigger: removeClient, isMutating: isDeleting } = useRemove("/api/clients")
  const modal = useCrudModal<Client>()
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  async function handleSubmit(data: ClientFormData) {
    try {
      if (modal.editing) {
        await updateClient({ ...data, id: modal.editing.id })
        toast.success("Cliente atualizado com sucesso!")
      } else {
        await createClient(data)
        toast.success("Cliente criado com sucesso!")
      }
      mutateList("/api/clients")
      modal.close()
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar")
    }
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
    onEdit: modal.openEdit,
    onDelete: setDeletingClient,
    onToggleFavorite: (client) => { void handleToggleFavorite(client) },
    canFavorite,
    canUpdate,
    canDelete,
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
        <Dialog open={modal.open} onOpenChange={modal.onOpenChange}>
          <DialogTrigger render={<Button onClick={modal.openCreate}><Plus className="size-4" /> Novo Cliente</Button>} />
          <ClientForm
            key={modal.sessionId}
            defaultValues={modal.editing ?? undefined}
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
