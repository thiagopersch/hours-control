"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { useTheme } from "next-themes"
import { AlertTriangle, CalendarClock, Building2, Users, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useClients, useAnalysts, useContracts, useDemandStats } from "@/hooks/use-api"

type Stats = {
  total: number
  byStatus: { status: string; count: number }[]
  byClient: { clientId: string; clientName: string; count: number; totalMinutes: number }[]
  byAnalyst: { analystId: string; analystName: string; analystColor: string; count: number; totalMinutes: number }[]
  monthlyEvolution: { year: number; month: number; totalMinutes: number; count: number }[]
}

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  ON_HOLD: "#8b5cf6",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  ON_HOLD: "Pausado",
}

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: any }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="mt-2 h-9 w-16" />
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, error: statsError, isLoading: statsLoading } = useDemandStats()
  const { data: clients } = useClients()
  const { data: analysts } = useAnalysts()
  const { data: contracts } = useContracts()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const counts = {
    clients: clients?.length ?? 0,
    analysts: analysts?.length ?? 0,
    contracts: contracts?.length ?? 0,
  }

  const monthlyData = (stats?.monthlyEvolution ?? []).map((m: { month: number; year: number; totalMinutes: number; count: number }) => ({
    name: `${monthNames[m.month - 1]}/${m.year}`,
    horas: Math.round(m.totalMinutes / 60),
    demandas: m.count,
  }))

  const statusData = (stats?.byStatus ?? []).map((s: { status: string; count: number }) => ({
    name: statusLabels[s.status] ?? s.status,
    value: s.count,
    color: statusColors[s.status] ?? "#6b7280",
  }))

  const clientData = (stats?.byClient ?? []).map((c: { clientId: string; clientName: string; count: number; totalMinutes: number }) => ({
    name: c.clientName.length > 16 ? c.clientName.slice(0, 16) + "..." : c.clientName,
    horas: Math.round(c.totalMinutes / 60),
  }))

  const analystData = (stats?.byAnalyst ?? []).map((a: { analystId: string; analystName: string; analystColor: string; count: number; totalMinutes: number }) => ({
    name: a.analystName.length > 16 ? a.analystName.slice(0, 16) + "..." : a.analystName,
    horas: Math.round(a.totalMinutes / 60),
  }))

  const totalHours = Math.round(
    (stats?.monthlyEvolution ?? []).reduce((acc: number, m: { totalMinutes: number }) => acc + m.totalMinutes, 0) / 60
  )

  const chartText = isDark ? "#a1a1aa" : "#71717a"
  const chartGrid = isDark ? "#27272a" : "#e4e4e7"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
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
            <StatCard title="Horas Lancadas" value={totalHours} icon={CalendarClock} />
            <StatCard title="Clientes" value={counts.clients} icon={Building2} />
            <StatCard title="Analistas" value={counts.analysts} icon={Users} />
            <StatCard title="Contratos" value={counts.contracts} icon={FileText} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Evolucao Mensal (horas)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: chartText, fontSize: 12 }} />
              <YAxis tick={{ fill: chartText, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#18181b" : "#fff",
                  border: `1px solid ${chartGrid}`,
                  borderRadius: 8,
                  color: isDark ? "#fff" : "#000",
                }}
              />
              <Area
                type="monotone"
                dataKey="horas"
                stroke="#6366f1"
                fill="url(#colorHoras)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Demandas por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry: { name: string; value: number; color: string }, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: isDark ? "#18181b" : "#fff",
                  border: `1px solid ${chartGrid}`,
                  borderRadius: 8,
                  color: isDark ? "#fff" : "#000",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {statusData.map((s: { name: string; value: number; color: string }) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">
                  {s.name} ({s.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Top Clientes (horas)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientData} layout="vertical">
              <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: chartText, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: chartText, fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#18181b" : "#fff",
                  border: `1px solid ${chartGrid}`,
                  borderRadius: 8,
                  color: isDark ? "#fff" : "#000",
                }}
              />
              <Bar dataKey="horas" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Top Analistas (horas)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analystData} layout="vertical">
              <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: chartText, fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: chartText, fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#18181b" : "#fff",
                  border: `1px solid ${chartGrid}`,
                  borderRadius: 8,
                  color: isDark ? "#fff" : "#000",
                }}
              />
              <Bar dataKey="horas" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
