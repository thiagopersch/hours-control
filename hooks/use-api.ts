import useSWR, { mutate as globalMutate } from "swr"
import { fetcher, apiMutate } from "@/lib/fetcher"
import useSWRMutation from "swr/mutation"

function listKey(url: string, params?: Record<string, string>) {
  if (!params) return url
  const qs = new URLSearchParams(params).toString()
  return `${url}?${qs}`
}

export function useClients() {
  return useSWR<any[]>("/api/clients", fetcher)
}

export function useAnalysts() {
  return useSWR<any[]>("/api/analysts", fetcher)
}

export function useContracts() {
  return useSWR<any[]>("/api/contracts", fetcher)
}

export function useRequesters() {
  return useSWR<any[]>("/api/requesters", fetcher)
}

export function useDepartments() {
  return useSWR<any[]>("/api/departments", fetcher)
}

export function useDemandTypes() {
  return useSWR<any[]>("/api/demand-types", fetcher)
}

export function useTags() {
  return useSWR<any[]>("/api/tags", fetcher)
}

export function useUsers() {
  return useSWR<any[]>("/api/users", fetcher)
}

export function useRoles() {
  return useSWR<any[]>("/api/roles", fetcher)
}

export function usePermissions() {
  return useSWR<any[]>("/api/permissions", fetcher)
}

export function useExports() {
  return useSWR<any[]>("/api/exports", fetcher)
}

export function useOrganizations() {
  return useSWR<any[]>("/api/organizations", fetcher)
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useNotifications(unreadOnly?: boolean) {
  return useSWR<PaginatedResponse<any>>(
    listKey("/api/notifications", unreadOnly ? { unread: "true" } : undefined),
    fetcher
  )
}

export function useDemands(filters?: Record<string, string>) {
  return useSWR<PaginatedResponse<any>>(listKey("/api/demands", filters), fetcher)
}

export type DemandStats = {
  total: number
  totalMinutes: number
  monthlyEvolution: { month: number; year: number; totalMinutes: number; count: number }[]
  byStatus: { status: string; count: number }[]
  byClient: { clientId: string; clientName: string; count: number; totalMinutes: number }[]
  byAnalyst: { analystId: string; analystName: string; analystColor: string; count: number; totalMinutes: number }[]
  byDepartment: { departmentId: string | null; departmentName: string; count: number; totalMinutes: number }[]
  byDemandType: { demandTypeId: string | null; demandTypeName: string; demandTypeColor: string; count: number; totalMinutes: number }[]
  byPriority: { priority: string; count: number; avgMinutes: number }[]
  clientFinancials: {
    clientId: string
    clientName: string
    contractedHours: number
    consumedHours: number
    revenue: number
    cost: number
    margin: number
  }[]
}

export function useDemandStats(filters?: Record<string, string>) {
  return useSWR<DemandStats>(listKey("/api/demands/stats", filters), fetcher)
}

export function useCreate(key: string) {
  return useSWRMutation(
    key,
    (url: string, { arg }: { arg: Record<string, unknown> }) =>
      apiMutate(url, { method: "POST", body: JSON.stringify(arg) })
  )
}

export function useUpdate(key: string) {
  return useSWRMutation(
    key,
    (url: string, { arg }: { arg: Record<string, unknown> & { id: string } }) => {
      const { id, ...rest } = arg
      return apiMutate(`${url}/${id}`, { method: "PUT", body: JSON.stringify(rest) })
    }
  )
}

export function useRemove(key: string) {
  return useSWRMutation(
    key,
    (url: string, { arg }: { arg: { id: string } }) =>
      apiMutate(`${url}/${arg.id}`, { method: "DELETE" })
  )
}

export function mutateList(key: string) {
  return globalMutate((k) => typeof k === "string" && k.startsWith(key))
}
