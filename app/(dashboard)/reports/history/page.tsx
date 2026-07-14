"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Download, RotateCw } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { fetcher } from "@/lib/fetcher"
import { useExports } from "@/hooks/use-api"
import { useReportExport } from "../hooks/use-report-export"

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "outline",
  PROCESSING: "secondary",
  PENDING: "secondary",
  FAILED: "destructive",
}

const statusLabels: Record<string, string> = {
  COMPLETED: "Concluído",
  PROCESSING: "Processando",
  PENDING: "Pendente",
  FAILED: "Falhou",
}

export default function ReportsHistoryPage() {
  const { data: exports, isLoading } = useExports()
  const { exportReport } = useReportExport()
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  async function handleRegenerate(exp: any) {
    setRegeneratingId(exp.id)
    try {
      const filters: Record<string, string> = exp.filters ?? {}
      const query = new URLSearchParams({ ...filters, limit: "1000" }).toString()
      const result = await fetcher<{ data: any[] }>(`/api/demands?${query}`)
      exportReport(String(exp.format).toLowerCase() as "xlsx" | "csv" | "json" | "pdf", result.data ?? [], filters)
    } catch {
      toast.error("Não foi possível gerar o relatório novamente.")
    } finally {
      setRegeneratingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" nativeButton={false} render={<Link href="/reports" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Todos os Relatórios</h1>
          <p className="text-muted-foreground">Histórico completo de relatórios gerados</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !exports?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum relatório gerado ainda.</p>
          ) : (
            exports.map((exp: any) => (
              <div
                key={exp.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{exp.format}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(exp.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariants[exp.status] ?? "outline"}>
                    {statusLabels[exp.status] ?? exp.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerate(exp)}
                    disabled={regeneratingId === exp.id}
                  >
                    {regeneratingId === exp.id ? <Spinner /> : <RotateCw className="size-4" />}
                    Gerar novamente
                  </Button>
                  {exp.fileUrl && (
                    <a href={exp.fileUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                      <Download className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
