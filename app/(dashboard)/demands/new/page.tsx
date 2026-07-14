"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { DemandForm } from "../ui/demand-form"
import { useDemandFormData } from "../hooks/use-demand-form-data"
import { useCreate, mutateList } from "../hooks/use-demands"
import { FetchError } from "@/lib/fetcher"

export default function NewDemandPage() {
  const router = useRouter()
  const { restrictedAnalystId, analysts, clients, requesters, departments, demandTypes } =
    useDemandFormData()
  const { trigger: createDemand, isMutating: creating } = useCreate("/api/demands")

  const [formKey, setFormKey] = useState(0)
  const [showPostCreate, setShowPostCreate] = useState(false)

  async function handleSubmit(data: Record<string, unknown>) {
    try {
      const totalMinutes = (Number(data.durationHours) || 0) * 60 + (Number(data.durationMinutes) || 0)
      const payload = { ...data, durationMinutes: totalMinutes }
      delete (payload as any).durationHours

      await createDemand(payload as any)
      await mutateList("/api/demands")
      toast.success("Demanda criada com sucesso!")
      setShowPostCreate(true)
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar demanda")
    }
  }

  function handleCreateAnother() {
    setShowPostCreate(false)
    setFormKey((k) => k + 1)
  }

  function handleBackToDashboard() {
    router.push("/dashboard")
  }

  return (
    <div className="space-y-6">
      <DemandForm
        key={formKey}
        analysts={analysts}
        clients={clients}
        requesters={requesters}
        departments={departments}
        demandTypes={demandTypes}
        lockedAnalystId={restrictedAnalystId}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/demands")}
        loading={creating}
      />

      <AlertDialog open={showPostCreate} onOpenChange={setShowPostCreate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demanda criada com sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja criar outra demanda ou voltar ao dashboard?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleBackToDashboard}>
              Voltar ao Dashboard
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateAnother}>
              Criar outra demanda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
