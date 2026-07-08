import { useMemo, useState } from "react"
import { useClients, useAnalysts, useContracts, useDemandStats } from "@/hooks/use-api"

export { useClients, useAnalysts, useContracts, useDemandStats }

export function usePeriodFilter() {
  const [year, setYear] = useState<string>("")
  const [month, setMonth] = useState<string>("")

  const filters = useMemo(() => {
    if (!year) return undefined
    const y = Number(year)
    const m = month ? Number(month) : undefined
    const startDate = m ? new Date(y, m - 1, 1) : new Date(y, 0, 1)
    const endDate = m ? new Date(y, m, 0) : new Date(y, 11, 31)
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }
  }, [year, month])

  return { year, setYear, month, setMonth, filters }
}
