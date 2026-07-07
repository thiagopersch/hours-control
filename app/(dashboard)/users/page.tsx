"use client"

import { useState } from "react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { Plus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import type { User } from "./_columns"
import { getUserColumns } from "./_columns"
import { UserForm } from "./ui/user-form"
import { UserDeleteDialog } from "./ui/user-delete-dialog"
import type { UserFormData } from "./schema/user-schema"
import { useUsers, useCreate, useUpdate, useRemove, mutateList } from "./hooks/use-users"
import useSWR from "swr"
import { fetcher, FetchError } from "@/lib/fetcher"

export default function UsersPage() {
  const { data: users, error, isLoading } = useUsers()
  const { data: roles } = useSWR<any[]>("/api/roles", fetcher)

  const { trigger: createUser, isMutating: creating } = useCreate("/api/users")
  const { trigger: updateUser, isMutating: updating } = useUpdate("/api/users")
  const { trigger: removeUser, isMutating: removing } = useRemove("/api/users")

  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: Record<string, unknown>) {
    try {
      if (editing) {
        await updateUser({ id: editing.id, ...data } as any)
        toast.success("Usuário atualizado com sucesso!")
      } else {
        await createUser(data as any)
        toast.success("Usuário criado com sucesso!")
      }
      await mutateList("/api/users")
      setOpen(false)
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar usuário")
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeUser({ id: deleting.id } as any)
      await mutateList("/api/users")
      toast.success("Usuário removido com sucesso!")
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao remover usuário")
    }
  }

  function handleEdit(user: User) {
    setEditing(user)
    setOpen(true)
  }

  const columns = getUserColumns({ onEdit: handleEdit, onDelete: setDeleting })
  const loading = creating || updating || removing

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Erro ao carregar usuários</AlertTitle>
        <AlertDescription>{error instanceof FetchError ? error.message : "Tente novamente mais tarde."}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}>
          <DialogTrigger render={<Button><Plus className="size-4" /> Novo Usuário</Button>} />
          <UserForm
            key={editing?.id ?? "new"}
            roles={roles ?? []}
            defaultValues={
              editing
                ? {
                    name: editing.name,
                    email: editing.email,
                    status: editing.status,
                    roleIds: editing.userRoles?.map((ur) => ur.role.id) ?? [],
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
        <DataTable columns={columns} data={users ?? []} showSearch searchPlaceholder="Buscar por nome, email..." />
      )}

      <UserDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => { if (!v) setDeleting(null) }}
        userName={deleting?.name}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  )
}
