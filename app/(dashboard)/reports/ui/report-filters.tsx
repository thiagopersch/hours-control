"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import { ColoredSelect } from "@/components/ui/colored-select"
import { Spinner } from "@/components/ui/spinner"
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  FileJson,
  Printer,
  Search,
} from "lucide-react"
import type { ReportFilters } from "../hooks/use-reports"

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendente", color: "#94a3b8" },
  { value: "IN_PROGRESS", label: "Em Andamento", color: "#3b82f6" },
  { value: "COMPLETED", label: "Concluída", color: "#22c55e" },
  { value: "ON_HOLD", label: "Em Espera", color: "#f59e0b" },
  { value: "CANCELLED", label: "Cancelada", color: "#ef4444" },
]

type ReportFiltersCardProps = {
  filters: ReportFilters
  setFilter: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void
  clients: { id: string; name: string; color?: string }[]
  analysts: { id: string; name: string; color?: string }[]
  onGenerate: () => void
  onExport: (format: "xlsx" | "csv" | "json" | "pdf") => void
  onPrint: () => void
  generating?: boolean
  canPrint?: boolean
}

export function ReportFiltersCard({
  filters,
  setFilter,
  clients,
  analysts,
  onGenerate,
  onExport,
  onPrint,
  generating = false,
  canPrint = false,
}: ReportFiltersCardProps) {
  const clientOptions = [
    { value: "", label: "Todos" },
    ...clients.map((c) => ({ value: c.id, label: c.name, color: c.color })),
  ]
  const analystOptions = [
    { value: "", label: "Todos" },
    ...analysts.map((a) => ({ value: a.id, label: a.name, color: a.color })),
  ]

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field>
          <Label>Data Início</Label>
          <DatePicker
            value={filters.startDate ? new Date(filters.startDate + "T00:00:00") : undefined}
            onChange={(date) => setFilter("startDate", date ? date.toISOString().split("T")[0] : "")}
            placeholder="Selecione a data"
          />
        </Field>

        <Field>
          <Label>Data Fim</Label>
          <DatePicker
            value={filters.endDate ? new Date(filters.endDate + "T00:00:00") : undefined}
            onChange={(date) => setFilter("endDate", date ? date.toISOString().split("T")[0] : "")}
            placeholder="Selecione a data"
          />
        </Field>

        <Field>
          <Label>Cliente</Label>
          <ColoredSelect
            options={clientOptions}
            value={filters.clientId}
            onValueChange={(v) => setFilter("clientId", v)}
            placeholder="Todos"
          />
        </Field>

        <Field>
          <Label>Analista</Label>
          <ColoredSelect
            options={analystOptions}
            value={filters.analystId}
            onValueChange={(v) => setFilter("analystId", v)}
            placeholder="Todos"
          />
        </Field>

        <Field>
          <Label>Status</Label>
          <ColoredSelect
            options={statusOptions}
            value={filters.status}
            onValueChange={(v) => setFilter("status", v)}
            placeholder="Todos"
          />
        </Field>

        <Button className="w-full" onClick={onGenerate} disabled={generating}>
          {generating ? <Spinner /> : <Search className="size-4" />}
          {generating ? "Gerando..." : "Gerar Relatório"}
        </Button>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Exportar como</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-start" onClick={() => onExport("xlsx")}>
              <FileSpreadsheet className="size-4" />
              XLSX
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => onExport("pdf")}>
              <FileText className="size-4" />
              PDF
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => onExport("csv")}>
              <FileDown className="size-4" />
              CSV
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => onExport("json")}>
              <FileJson className="size-4" />
              JSON
            </Button>
          </div>
        </div>

        <Button className="w-full" variant="secondary" onClick={onPrint} disabled={!canPrint}>
          <Printer className="size-4" />
          Imprimir
        </Button>
      </CardContent>
    </Card>
  )
}
