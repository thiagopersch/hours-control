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

type DemandDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  demandName: string | undefined
  onConfirm: () => void
  loading?: boolean
}

export function DemandDeleteDialog({
  open,
  onOpenChange,
  demandName,
  onConfirm,
  loading,
}: DemandDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Demanda</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a demanda {demandName}? Esta ação não pode ser desfeita.
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
