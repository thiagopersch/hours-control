"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import type { Role } from "./_columns"
import { getRoleColumns } from "./_columns"
import { RoleForm } from "./ui/role-form"
import { RoleDeleteDialog } from "./ui/role-delete-dialog"
import type { RoleFormData } from "./schema/role-schema"
import { useRoles, usePermissions, useCreate, useUpdate, useRemove, mutateList } from "./hooks/use-roles"
import { FetchError } from "@/lib/fetcher"

export default function RolesPage() {
  const { data: roles, error, isLoading } = useRoles()
  const { data: permissions } = usePermissions()

  const { trigger: createRole, isMutating: creating } = useCreate("/api/roles")
  const { trigger: updateRole, isMutating: updating } = useUpdate("/api/roles")
  const { trigger: removeRole, isMutating: removing } = useRemove("/api/roles")

  const [editing, setEditing] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)
  const [open, setOpen] = useState(false)

  const permissionGroups = useMemo(() => {
    if (!permissions) return []
    return permissions.map((group: any) => ({
      resource: group.resource,
      permissions: (group.permissions || group.rolePermissions?.map((rp: any) => rp.permission) || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? "",
      })),
    }))
  }, [permissions])

  async function handleSubmit(data: Record<string, unknown>) {
    try {
      if (editing) {
        await updateRole({ id: editing.id, ...data } as any)
        toast.success("Perfil atualizado com sucesso!")
      } else {
        await createRole(data as any)
        toast.success("Perfil criado com sucesso!")
      }
      await mutateList("/api/roles")
      setOpen(false)
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar perfil")
    }
  }

  async function handleDelete() {
    if (!deleting || deleting.isSystem) return
    try {
      await removeRole({ id: deleting.id } as any)
      await mutateList("/api/roles")
      toast.success("Perfil removido com sucesso!")
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao remover perfil")
    }
  }

  function handleEdit(role: Role) {
    if (role.isSystem) return
    setEditing(role)
    setOpen(true)
  }

  const columns = getRoleColumns({ onEdit: handleEdit, onDelete: setDeleting })
  const loading = creating || updating || removing

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Erro ao carregar perfis</AlertTitle>
        <AlertDescription>{error instanceof FetchError ? error.message : "Tente novamente mais tarde."}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis</h1>
          <p className="text-muted-foreground">Gerencie os perfis de acesso do sistema</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}>
          <DialogTrigger render={<Button><Plus className="size-4" /> Novo Perfil</Button>} />
          <RoleForm
            key={editing?.id ?? "new"}
            permissionGroups={permissionGroups}
            defaultValues={
              editing
                ? {
                    name: editing.name,
                    description: editing.description,
                    permissionIds: ((editing as any).rolePermissions ?? []).map(
                      (rp: any) => rp.permission?.id ?? rp.permissionId
                    ),
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
        <DataTable columns={columns} data={roles ?? []} showSearch searchPlaceholder="Buscar por nome..." />
      )}

      <RoleDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => { if (!v) setDeleting(null) }}
        roleName={deleting?.name}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  )
}
