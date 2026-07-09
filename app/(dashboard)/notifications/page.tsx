"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCheck, Eye, EyeOff, Trash2, AlertCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNotifications, useUpdate, useRemove, mutateList } from "@/hooks/use-api"
import { FetchError } from "@/lib/fetcher"

type Notification = {
  id: string
  title: string
  body: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

const typeVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  info: "default",
  success: "outline",
  warning: "secondary",
  error: "destructive",
}

const typeLabels: Record<string, string> = {
  info: "Info",
  success: "Sucesso",
  warning: "Alerta",
  error: "Erro",
}

export default function NotificationsPage() {
  const { data: notificationsResponse, error, isLoading } = useNotifications()
  const notifications: Notification[] = notificationsResponse?.data ?? []
  const { trigger: updateNotification } = useUpdate("/api/notifications")
  const { trigger: removeNotification } = useRemove("/api/notifications")

  const [deleting, setDeleting] = useState<Notification | null>(null)

  async function toggleRead(notification: Notification) {
    try {
      await updateNotification({ id: notification.id, read: !notification.read } as any)
      await mutateList("/api/notifications")
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao atualizar notificação")
    }
  }

  async function markAllAsRead() {
    try {
      const unread = notifications.filter((n: Notification) => !n.read)
      await Promise.all(unread.map((n: Notification) => updateNotification({ id: n.id, read: true } as any)))
      await mutateList("/api/notifications")
      toast.success("Todas as notificações marcadas como lidas!")
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao marcar notificações")
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await removeNotification({ id: deleting.id } as any)
      await mutateList("/api/notifications")
      toast.success("Notificação removida!")
      setDeleting(null)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao remover notificação")
    }
  }

  const columns: ColumnDef<Notification>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {!row.original.read && (
            <span className="size-2 rounded-full bg-primary shrink-0" />
          )}
          <span className={row.original.read ? "text-muted-foreground" : "font-medium"}>
            {row.original.title}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "body",
      header: "Mensagem",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1">
          {row.original.body}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant={typeVariants[row.original.type] || "secondary"}>
          {typeLabels[row.original.type] || row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "read",
      header: "Lida",
      cell: ({ row }) =>
        row.original.read ? (
          <span className="text-muted-foreground text-sm">Sim</span>
        ) : (
          <Badge variant="default">Não</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => toggleRead(row.original)}>
            {row.original.read ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(row.original)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Erro ao carregar notificações</AlertTitle>
        <AlertDescription>{error instanceof FetchError ? error.message : "Tente novamente mais tarde."}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">Central de notificações do sistema</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          <CheckCheck className="size-4" />
          Marcar todas como lidas
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <DataTable columns={columns} data={notifications} showSearch searchPlaceholder="Buscar por título..." />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Notificação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta notificação?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
