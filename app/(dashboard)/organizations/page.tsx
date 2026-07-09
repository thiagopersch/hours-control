"use client"

import { Dialog } from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table"
import { toast } from "sonner"
import { Organization, getOrganizationColumns } from "./_columns"
import { OrganizationForm } from "./ui/organization-form"
import type { OrganizationFormData } from "./schema/organization-schema"
import { useOrganizations, useUpdate, mutateList } from "@/hooks/use-api"
import { FetchError } from "@/lib/fetcher"
import { useCrudModal } from "@/hooks/use-crud-modal"

export default function OrganizationsPage() {
  const { data: organizations, error, isLoading } = useOrganizations()
  const { trigger: updateOrganization, isMutating: isUpdating } = useUpdate("/api/organizations")
  const modal = useCrudModal<Organization>()

  async function handleSubmit(data: OrganizationFormData) {
    if (!modal.editing) return
    try {
      await updateOrganization({ ...data, id: modal.editing.id })
      toast.success("Organização atualizada com sucesso!")
      mutateList("/api/organizations")
      modal.close()
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar")
    }
  }

  const columns = getOrganizationColumns({ onEdit: modal.openEdit })

  if (isLoading) return <div className="flex items-center justify-center py-20"><span className="text-muted-foreground">Carregando...</span></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizações</h1>
          <p className="text-muted-foreground">Gerencie todas as organizations do sistema</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={organizations ?? []}
        showSearch
        searchPlaceholder="Buscar por nome..."
      />

      <Dialog open={modal.open} onOpenChange={(v) => { if (!v) modal.close() }}>
        {modal.editing && (
          <OrganizationForm
            key={modal.sessionId}
            defaultValues={modal.editing}
            onSubmit={handleSubmit}
            loading={isUpdating}
          />
        )}
      </Dialog>
    </div>
  )
}
