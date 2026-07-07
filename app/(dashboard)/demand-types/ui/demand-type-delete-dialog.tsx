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

type DemandType = {
  id: string
  name: string
}

type DemandTypeDeleteDialogProps = {
  demandType: DemandType | null
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DemandTypeDeleteDialog({
  demandType,
  onClose,
  onConfirm,
  loading,
}: DemandTypeDeleteDialogProps) {
  return (
    <AlertDialog open={!!demandType} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Tipo de Demanda</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {demandType?.name}? Esta ação não pode ser desfeita.
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
