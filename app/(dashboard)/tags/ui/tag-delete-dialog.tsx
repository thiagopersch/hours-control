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

type TagDeleteDialogProps = {
  tag: { id: string; name: string } | null
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function TagDeleteDialog({
  tag,
  onClose,
  onConfirm,
  loading,
}: TagDeleteDialogProps) {
  return (
    <AlertDialog open={!!tag} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Tag</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a tag {tag?.name}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive" disabled={loading}>
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
