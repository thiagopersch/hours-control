"use client"

import { useState, useRef } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useTheme } from "next-themes"
import {
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Table2,
} from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type ChartDatum = { name: string; value: number; color?: string }
export type ChartType = "barra" | "pizza" | "linha" | "tabela"

type ChartCardProps = {
  title: string
  data: ChartDatum[]
  valueLabel?: string
  defaultType?: ChartType
  chartRef?: React.RefObject<HTMLDivElement | null>
}

const DEFAULT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6"]

export function ChartCard({ title, data, valueLabel = "valor", defaultType = "barra", chartRef }: ChartCardProps) {
  const [type, setType] = useState<ChartType>(defaultType)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const chartText = isDark ? "#a1a1aa" : "#71717a"
  const chartGrid = isDark ? "#27272a" : "#e4e4e7"
  const localRef = useRef<HTMLDivElement>(null)
  const ref = chartRef ?? localRef

  const tooltipStyle = {
    background: isDark ? "#18181b" : "#fff",
    border: `1px solid ${chartGrid}`,
    borderRadius: 8,
    color: isDark ? "#fff" : "#000",
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <ToggleGroup
          value={[type]}
          onValueChange={(v) => {
            if (v.length) setType(v[0] as ChartType)
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="barra" aria-label="Barras" title="Barras">
            <BarChart3 className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="pizza" aria-label="Pizza" title="Pizza">
            <PieChartIcon className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="linha" aria-label="Linha" title="Linha">
            <LineChartIcon className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="tabela" aria-label="Tabela" title="Tabela">
            <Table2 className="size-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {type === "tabela" ? (
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right capitalize">{valueLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((d) => (
                <TableRow key={d.name}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell className="text-right">{d.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div ref={ref}>
          <ResponsiveContainer width="100%" height={300} debounce={200}>
            {type === "pizza" ? (
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            ) : type === "linha" ? (
              <LineChart data={data}>
                <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: chartText, fontSize: 11 }} />
                <YAxis tick={{ fill: chartText, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={data} layout="vertical">
                <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: chartText, fontSize: 11 }} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
