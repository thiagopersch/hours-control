"use client"

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

type Requester = {
  id: string
  name: string
}

type RequesterDeleteDialogProps = {
  requester: Requester | null
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function RequesterDeleteDialog({
  requester,
  onClose,
  onConfirm,
  loading,
}: RequesterDeleteDialogProps) {
  return (
    <AlertDialog open={!!requester} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Solicitante</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {requester?.name}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive" disabled={loading}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
