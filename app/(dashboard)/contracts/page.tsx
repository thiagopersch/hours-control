"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useClients } from "@/hooks/use-api"
import { FetchError } from "@/lib/fetcher"
import { Contract, getContractColumns } from "./_columns"
import { ContractForm } from "./ui/contract-form"
import type { ContractFormData } from "./schema/contract-schema"
import { ContractDeleteDialog } from "./ui/contract-delete-dialog"
import { useContracts, useCreate, useUpdate, useRemove, mutateList } from "./hooks/use-contracts"
import { useCrudModal } from "@/hooks/use-crud-modal"

export default function ContractsPage() {
  const { data: contracts, error, isLoading } = useContracts()
  const { data: allClients } = useClients()
  const { trigger: createContract, isMutating: isCreating } = useCreate("/api/contracts")
  const { trigger: updateContract, isMutating: isUpdating } = useUpdate("/api/contracts")
  const { trigger: removeContract, isMutating: isDeleting } = useRemove("/api/contracts")
  const modal = useCrudModal<Contract>()
  const [deleting, setDeleting] = useState<Contract | null>(null)

  const clientOptions = (allClients ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    color: c.color,
  }))

  async function handleSubmit(data: ContractFormData) {
    try {
      const payload = {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
      }
      if (modal.editing) {
        await updateContract({ ...payload, id: modal.editing.id })
        toast.success("Contrato atualizado com sucesso!")
      } else {
        await createContract(payload)
        toast.success("Contrato criado com sucesso!")
      }
      mutateList("/api/contracts")
      modal.close()
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar")
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeContract({ id: deleting.id })
      mutateList("/api/contracts")
      toast.success("Contrato removido com sucesso!")
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao excluir")
    }
  }

  const columns = getContractColumns({ onEdit: modal.openEdit, onDelete: setDeleting })

  if (isLoading) return <div className="flex items-center justify-center py-20"><span className="text-muted-foreground">Carregando...</span></div>
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">Erro ao carregar: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground">Gerencie os contratos dos clientes</p>
        </div>
        <Dialog open={modal.open} onOpenChange={modal.onOpenChange}>
          <DialogTrigger render={<Button onClick={modal.openCreate}><Plus className="size-4" /> Novo Contrato</Button>} />
          <ContractForm
            key={modal.sessionId}
            clients={clientOptions}
            defaultValues={modal.editing ? {
              clientId: modal.editing.clientId,
              contractedHours: modal.editing.contractedHours,
              hourlyRate: modal.editing.hourlyRate,
              startDate: new Date(modal.editing.startDate),
              endDate: new Date(modal.editing.endDate),
              notes: modal.editing.notes,
              status: modal.editing.status,
            } : undefined}
            onSubmit={handleSubmit}
            loading={isCreating || isUpdating}
          />
        </Dialog>
      </div>

      <DataTable columns={columns} data={contracts ?? []} showSearch searchPlaceholder="Buscar por cliente..." />

      <ContractDeleteDialog
        contract={deleting ? { id: deleting.id, clientName: deleting.client?.name ?? "" } : null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  )
}
