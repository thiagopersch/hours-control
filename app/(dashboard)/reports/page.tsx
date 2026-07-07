"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { useDemands } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  FileJson,
  Printer,
  BarChart3,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react"
import { toast } from "sonner"

const statusLabels: Record<string, string> = {
  open: "Aberta",
  in_progress: "Em Andamento",
  resolved: "Resolvida",
  closed: "Fechada",
  cancelled: "Cancelada",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  in_progress: "secondary",
  resolved: "outline",
  closed: "default",
  cancelled: "destructive",
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export default function ReportsPage() {
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [clientId, setClientId] = useState("")
  const [analystId, setAnalystId] = useState("")
  const [status, setStatus] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string> | undefined>(undefined)

  const filters: Record<string, string> = {}
  if (periodStart) filters.startDate = periodStart
  if (periodEnd) filters.endDate = periodEnd
  if (clientId) filters.clientId = clientId
  if (analystId) filters.analystId = analystId
  if (status) filters.status = status

  const { data: demands, isLoading, error } = useDemands(appliedFilters)
  const { data: clients } = useSWR<any[]>("/api/clients", fetcher)
  const { data: analysts } = useSWR<any[]>("/api/analysts", fetcher)

  function handleGenerate() {
    setAppliedFilters(Object.keys(filters).length > 0 ? filters : undefined)
  }

  function handleExport(format: string) {
    toast.success(`Relatório exportado como ${format.toUpperCase()}!`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Gere e exporte relatórios do sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <Label>Data Início</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </Field>

            <Field>
              <Label>Data Fim</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </Field>

            <Field>
              <Label>Cliente</Label>
              <NativeSelect value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">Todos</option>
                {clients?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <Label>Analista</Label>
              <NativeSelect value={analystId} onChange={(e) => setAnalystId(e.target.value)}>
                <option value="">Todos</option>
                {analysts?.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <Label>Status</Label>
              <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Todos</option>
                <option value="open">Aberta</option>
                <option value="in_progress">Em Andamento</option>
                <option value="resolved">Resolvida</option>
                <option value="closed">Fechada</option>
                <option value="cancelled">Cancelada</option>
              </NativeSelect>
            </Field>

            <Button className="w-full" onClick={handleGenerate}>
              <Search className="size-4" />
              Gerar Relatório
            </Button>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Exportar como</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start" onClick={() => handleExport("xlsx")}>
                  <FileSpreadsheet className="size-4" />
                  XLSX
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleExport("pdf")}>
                  <FileText className="size-4" />
                  PDF
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleExport("csv")}>
                  <FileDown className="size-4" />
                  CSV
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleExport("json")}>
                  <FileJson className="size-4" />
                  JSON
                </Button>
              </div>
            </div>

            <Button className="w-full" variant="secondary" onClick={() => handleExport("pdf")}>
              <Printer className="size-4" />
              Imprimir
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prévia do Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            {!appliedFilters ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BarChart3 className="size-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">Selecione os filtros</p>
                <p className="text-sm">
                  Escolha os filtros ao lado e clique em &ldquo;Gerar Relatório&rdquo; para visualizar os dados.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Loader2 className="size-8 mb-4 animate-spin" />
                <p className="text-sm">Carregando dados...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
                <AlertCircle className="size-8 mb-4" />
                <p className="text-sm font-medium">Erro ao carregar dados</p>
                <p className="text-xs">{(error)?.message}</p>
              </div>
            ) : !demands || demands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BarChart3 className="size-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhum resultado</p>
                <p className="text-sm">Nenhuma demanda encontrada com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Demanda</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Analista</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demands.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{d.name}</TableCell>
                        <TableCell>{d.client?.name ?? "-"}</TableCell>
                        <TableCell>{d.analyst?.name ?? "-"}</TableCell>
                        <TableCell>{d.date ? new Date(d.date).toLocaleDateString("pt-BR") : "-"}</TableCell>
                        <TableCell>{d.durationMinutes != null ? formatDuration(d.durationMinutes) : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[d.status] ?? "outline"}>
                            {statusLabels[d.status] ?? d.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-4">
                  Exibindo {demands.length} demanda{demands.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
