"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Loader2, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  ON_HOLD: "Em Espera",
  CANCELLED: "Cancelada",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  ON_HOLD: "secondary",
  CANCELLED: "destructive",
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

type ReportPreviewProps = {
  applied: boolean
  isLoading: boolean
  error: any
  demands: any[] | undefined
}

export function ReportPreview({ applied, isLoading, error, demands }: ReportPreviewProps) {
  return (
    <Card className="lg:col-span-2" id="report-preview">
      <CardHeader>
        <CardTitle>Prévia do Relatório</CardTitle>
      </CardHeader>
      <CardContent>
        {!applied ? (
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
            <p className="text-xs">{error?.message}</p>
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
                    <TableCell>{d.date ? formatDate(d.date) : "-"}</TableCell>
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
  )
}
