"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import { fetcher } from "@/lib/fetcher"

export function useDemandFormData() {
  const { data: session } = useSession()
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin as boolean | undefined
  const permissions = (session?.user as any)?.permissions as
    | { resource: string; action: string; scope: string }[]
    | undefined
  const ownAnalystId = (session?.user as any)?.analystId as string | null | undefined
  // "Locked to self" applies only when the analyst:read scope is narrower
  // than company-wide (OWN/TEAM/DEPARTMENT) - COMPANY/ALL means they're
  // allowed to see and pick from every analyst, same as an admin would.
  const analystScope = permissions?.find((p) => p.resource === "analyst" && p.action === "read")?.scope ?? "NONE"
  const canViewAllAnalysts = !!isSuperAdmin || analystScope === "COMPANY" || analystScope === "ALL"
  const restrictedAnalystId = !canViewAllAnalysts && ownAnalystId ? ownAnalystId : undefined

  const { data: analysts } = useSWR<any[]>("/api/analysts", fetcher)
  const { data: clients } = useSWR<any[]>("/api/clients", fetcher)
  const { data: requesters } = useSWR<any[]>("/api/requesters", fetcher)
  const { data: departments } = useSWR<any[]>("/api/departments", fetcher)
  const { data: demandTypes } = useSWR<any[]>("/api/demand-types", fetcher)

  return {
    restrictedAnalystId,
    analysts: analysts ?? [],
    clients: clients ?? [],
    requesters: requesters ?? [],
    departments: departments ?? [],
    demandTypes: demandTypes ?? [],
  }
}
