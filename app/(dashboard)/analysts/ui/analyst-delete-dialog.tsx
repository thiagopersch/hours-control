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
import type { Analyst } from "../_columns"

type AnalystDeleteDialogProps = {
  analyst: Analyst | null
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function AnalystDeleteDialog({
  analyst,
  onClose,
  onConfirm,
  loading,
}: AnalystDeleteDialogProps) {
  return (
    <AlertDialog open={!!analyst} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Analista</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {analyst?.name}? Esta ação não pode ser desfeita.
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
