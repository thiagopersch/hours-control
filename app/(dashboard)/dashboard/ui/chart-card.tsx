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
  LabelList,
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
import { formatDuration, formatCurrency } from "@/lib/utils"

export type ChartDatum = { name: string; value: number; color?: string }
export type ChartType = "barra" | "pizza" | "linha" | "tabela"
export type ChartValueFormat = "number" | "duration" | "percent" | "currency"

type ChartCardProps = {
  title: string
  data: ChartDatum[]
  valueLabel?: string
  /**
   * "duration" treats `value` as minutes and displays it as HH:mm.
   * "percent" appends "%". "currency" formats as BRL (R$).
   */
  valueFormat?: ChartValueFormat
  defaultType?: ChartType
  chartRef?: React.RefObject<HTMLDivElement | null>
  /** Always show name + value directly on the chart, regardless of the selected view */
  showLabels?: boolean
}

const DEFAULT_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6"]

export function ChartCard({
  title,
  data,
  valueLabel = "valor",
  valueFormat = "number",
  defaultType = "barra",
  chartRef,
  showLabels = false,
}: ChartCardProps) {
  const [type, setType] = useState<ChartType>(defaultType)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const chartText = isDark ? "#a1a1aa" : "#71717a"
  const chartGrid = isDark ? "#27272a" : "#e4e4e7"
  const textColor = isDark ? "#ffffff" : "#000000"
  const localRef = useRef<HTMLDivElement>(null)
  const ref = chartRef ?? localRef

  const formatValue = (value: unknown): string => {
    const num = typeof value === "number" ? value : Number(value)
    if (Number.isNaN(num)) return typeof value === "string" ? value : ""
    switch (valueFormat) {
      case "duration":
        return formatDuration(num)
      case "percent":
        return `${num}%`
      case "currency":
        return formatCurrency(num)
      default:
        return String(num)
    }
  }

  const tooltipStyle = {
    background: isDark ? "#18181b" : "#fff",
    border: `1px solid ${chartGrid}`,
    borderRadius: 8,
    color: textColor,
  }
  const tooltipLabelStyle = { color: textColor }
  const tooltipItemStyle = { color: textColor }
  const tooltipFormatter = (value: unknown): [string, string] => [formatValue(value), "Valor"]

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
                  <TableCell className="text-right">{formatValue(d.value)}</TableCell>
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
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={
                    showLabels
                      ? ({ name, value }: { name?: string; value?: number }) => `${name ?? ""}: ${formatValue(value)}`
                      : undefined
                  }
                  labelLine={showLabels}
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={tooltipFormatter}
                />
              </PieChart>
            ) : type === "linha" ? (
              <LineChart data={data} margin={showLabels ? { top: 24 } : undefined}>
                <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: chartText, fontSize: 11 }} />
                <YAxis tick={{ fill: chartText, fontSize: 12 }} tickFormatter={formatValue} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={tooltipFormatter}
                />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2}>
                  {showLabels && (
                    <LabelList dataKey="value" position="top" formatter={formatValue} fill={chartText} fontSize={11} />
                  )}
                </Line>
              </LineChart>
            ) : (
              <BarChart data={data} layout="vertical">
                <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: chartText, fontSize: 12 }} tickFormatter={formatValue} />
                <YAxis type="category" dataKey="name" tick={{ fill: chartText, fontSize: 11 }} width={120} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  itemStyle={tooltipItemStyle}
                  formatter={tooltipFormatter}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                  ))}
                  {showLabels && (
                    <LabelList dataKey="value" position="right" formatter={formatValue} fill={chartText} fontSize={11} />
                  )}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
