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

type Department = {
  id: string
  name: string
}

type DepartmentDeleteDialogProps = {
  department: Department | null
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DepartmentDeleteDialog({
  department,
  onClose,
  onConfirm,
  loading,
}: DepartmentDeleteDialogProps) {
  return (
    <AlertDialog open={!!department} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Setor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {department?.name}? Esta ação não pode ser desfeita.
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
