"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Download } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { useExports } from "@/hooks/use-api"

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

export function ReportHistory() {
  const { data: exports, isLoading } = useExports()

  if (isLoading || !exports?.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" />
          Relatórios anteriores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {exports.map((exp: any) => (
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
              {exp.fileUrl && (
                <a href={exp.fileUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                  <Download className="size-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
