"use client"

import { useRef } from "react"
import { AlertTriangle, CalendarClock, Building2, Users, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatCard, StatCardSkeleton } from "./ui/stat-card"
import { ChartCard } from "./ui/chart-card"
import { PeriodFilter } from "./ui/period-filter"
import { DashboardExportButton } from "./ui/export-button"
import { useClients, useAnalysts, useContracts, useDemandStats, usePeriodFilter } from "./hooks/use-dashboard"

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  ON_HOLD: "Pausado",
}

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  ON_HOLD: "#8b5cf6",
}

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

export default function DashboardPage() {
  const { year, setYear, month, setMonth, filters } = usePeriodFilter()
  const { data: stats, error: statsError, isLoading: statsLoading } = useDemandStats(filters)
  const { data: clients } = useClients()
  const { data: analysts } = useAnalysts()
  const { data: contracts } = useContracts()

  const evolutionRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<HTMLDivElement>(null)
  const analystRef = useRef<HTMLDivElement>(null)

  const counts = {
    clients: clients?.length ?? 0,
    analysts: analysts?.length ?? 0,
    contracts: contracts?.length ?? 0,
  }

  const monthlyEvolutionRaw = stats?.monthlyEvolution ?? []
  const monthlyData = monthlyEvolutionRaw.map((m) => ({
    name: `${monthNames[m.month - 1]}/${m.year}`,
    value: Math.round(m.totalMinutes / 60),
    horas: Math.round(m.totalMinutes / 60),
    demandas: m.count,
  }))

  const statusDataRaw = stats?.byStatus ?? []
  const statusData = statusDataRaw.map((s) => ({
    name: statusLabels[s.status] ?? s.status,
    value: s.count,
    color: statusColors[s.status] ?? "#6b7280",
  }))

  const clientDataRaw = stats?.byClient ?? []
  const clientData = clientDataRaw.map((c) => ({
    name: c.clientName.length > 16 ? c.clientName.slice(0, 16) + "..." : c.clientName,
    value: Math.round(c.totalMinutes / 60),
    horas: Math.round(c.totalMinutes / 60),
  }))

  const analystDataRaw = stats?.byAnalyst ?? []
  const analystData = analystDataRaw.map((a) => ({
    name: a.analystName.length > 16 ? a.analystName.slice(0, 16) + "..." : a.analystName,
    value: Math.round(a.totalMinutes / 60),
    horas: Math.round(a.totalMinutes / 60),
    color: a.analystColor,
  }))

  const totalHours = Math.round(monthlyEvolutionRaw.reduce((acc, m) => acc + m.totalMinutes, 0) / 60)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter year={year} onYearChange={setYear} month={month} onMonthChange={setMonth} />
          <DashboardExportButton
            monthlyData={monthlyData}
            statusData={statusData}
            clientData={clientData}
            analystData={analystData}
            chartRefs={[evolutionRef, statusRef, clientRef, analystRef]}
          />
        </div>
      </div>

      {statsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Demandas" value={stats?.total ?? 0} icon={CalendarClock} />
            <StatCard title="Horas Lançadas" value={totalHours} icon={CalendarClock} />
            <StatCard title="Clientes" value={counts.clients} icon={Building2} />
            <StatCard title="Analistas" value={counts.analysts} icon={Users} />
            <StatCard title="Contratos" value={counts.contracts} icon={FileText} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Evolução Mensal (horas)" data={monthlyData} valueLabel="horas" defaultType="linha" chartRef={evolutionRef} />
        <ChartCard title="Demandas por Status" data={statusData} valueLabel="demandas" defaultType="pizza" chartRef={statusRef} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Top Clientes (horas)" data={clientData} valueLabel="horas" defaultType="barra" chartRef={clientRef} />
        <ChartCard title="Top Analistas (horas)" data={analystData} valueLabel="horas" defaultType="barra" chartRef={analystRef} />
      </div>
    </div>
  )
}
