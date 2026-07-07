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

type ContractDeleteDialogProps = {
  contract: { id: string; clientName: string } | null
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function ContractDeleteDialog({
  contract,
  onClose,
  onConfirm,
  loading,
}: ContractDeleteDialogProps) {
  return (
    <AlertDialog open={!!contract} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o contrato de {contract?.clientName}? Esta ação não pode ser desfeita.
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
