import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { useDemands } from "@/hooks/use-api"

export type ReportFilters = {
  startDate: string
  endDate: string
  clientId: string
  analystId: string
  status: string
}

const emptyFilters: ReportFilters = {
  startDate: "",
  endDate: "",
  clientId: "",
  analystId: "",
  status: "",
}

export function useReportFilters() {
  const [filters, setFilters] = useState<ReportFilters>(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string> | undefined>(undefined)

  function setFilter<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function generate() {
    const query: Record<string, string> = {}
    if (filters.startDate) query.startDate = filters.startDate
    if (filters.endDate) query.endDate = filters.endDate
    if (filters.clientId) query.clientId = filters.clientId
    if (filters.analystId) query.analystId = filters.analystId
    if (filters.status) query.status = filters.status
    setAppliedFilters(Object.keys(query).length > 0 ? query : {})
  }

  return { filters, setFilter, appliedFilters, generate }
}

export function useReportData(appliedFilters: Record<string, string> | undefined) {
  const demandsQuery = useDemands(appliedFilters ? { ...appliedFilters, limit: "1000" } : undefined)
  const clients = useSWR<any[]>("/api/clients", fetcher)
  const analysts = useSWR<any[]>("/api/analysts", fetcher)
  const demands = {
    data: demandsQuery.data?.data,
    error: demandsQuery.error,
    isLoading: demandsQuery.isLoading,
  }
  return { demands, clients, analysts }
}
