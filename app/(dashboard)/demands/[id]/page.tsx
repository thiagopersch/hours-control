"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { DemandForm } from "../ui/demand-form"
import { useDemandFormData } from "../hooks/use-demand-form-data"
import { useUpdate, mutateList } from "../hooks/use-demands"
import { fetcher, FetchError } from "@/lib/fetcher"

function deniedFlagKey(id: string) {
  return `demand_denied_${id}`
}

export default function EditDemandPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const { restrictedAnalystId, analysts, clients, requesters, departments, demandTypes } =
    useDemandFormData()
  const { data: demand, error, isLoading } = useSWR<any>(`/api/demands/${id}`, fetcher)
  const { trigger: updateDemand, isMutating: updating } = useUpdate("/api/demands")

  const isForbidden = error instanceof FetchError && error.status === 403

  useEffect(() => {
    if (!isForbidden) return

    const flagKey = deniedFlagKey(id)
    const alreadyDenied = sessionStorage.getItem(flagKey) === "1"

    toast.error("Você não tem permissão para acessar esta demanda.", {
      position: "bottom-center",
    })

    if (alreadyDenied) {
      router.replace("/dashboard")
    } else {
      sessionStorage.setItem(flagKey, "1")
      router.replace("/demands")
    }
  }, [isForbidden, id, router])

  async function handleSubmit(data: Record<string, unknown>) {
    try {
      const totalMinutes = (Number(data.durationHours) || 0) * 60 + (Number(data.durationMinutes) || 0)
      const payload = { ...data, durationMinutes: totalMinutes }
      delete (payload as any).durationHours

      await updateDemand({ id, ...payload } as any)
      await mutateList("/api/demands")
      toast.success("Demanda atualizada com sucesso!")
      router.push("/demands")
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao salvar demanda")
    }
  }

  if (isLoading || isForbidden) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Demanda não encontrada</AlertTitle>
        <AlertDescription>
          {error instanceof FetchError ? error.message : "Tente novamente mais tarde."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <DemandForm
      analysts={analysts}
      clients={clients}
      requesters={requesters}
      departments={departments}
      demandTypes={demandTypes}
      lockedAnalystId={restrictedAnalystId}
      defaultValues={{
        date: demand.date,
        analystId: demand.analyst?.id ?? "",
        clientId: demand.client?.id ?? "",
        requesterId: demand.requester?.id ?? "",
        departmentId: demand.department?.id ?? "",
        demandTypeId: demand.demandType?.id ?? "",
        name: demand.name,
        description: demand.description,
        durationMinutes: demand.durationMinutes,
        priority: demand.priority,
        status: demand.status,
        notes: demand.notes,
      }}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/demands")}
      loading={updating}
    />
  )
}
