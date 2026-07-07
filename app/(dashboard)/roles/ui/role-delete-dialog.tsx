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

type RoleDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleName: string | undefined
  onConfirm: () => void
  loading?: boolean
}

export function RoleDeleteDialog({
  open,
  onOpenChange,
  roleName,
  onConfirm,
  loading,
}: RoleDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Perfil</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o perfil {roleName}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading} variant="destructive">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
