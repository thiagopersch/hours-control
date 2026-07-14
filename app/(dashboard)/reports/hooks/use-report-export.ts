import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import { toast } from "sonner"
import { apiMutate } from "@/lib/fetcher"
import { mutateList } from "@/hooks/use-api"
import { formatDate } from "@/lib/utils"

function toDecimalHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100
}

function toRows(demands: any[]) {
  return demands.map((d) => ({
    Data: d.date ? formatDate(d.date) : "-",
    "Nome do Analista": d.analyst?.name ?? "-",
    "Horas Executadas": d.durationMinutes != null ? toDecimalHours(d.durationMinutes) : 0,
    Demanda: d.name,
    Descricao: d.description ?? "-",
    Solicitante: d.requester?.name ?? "-",
    Setor: d.department?.name ?? "-",
    Cliente: d.client?.name ?? "-",
  }))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function useReportExport() {
  function exportReport(
    format: "xlsx" | "csv" | "json" | "pdf",
    demands: any[],
    filters?: Record<string, string>
  ) {
    if (!demands.length) {
      toast.error("Nenhum dado para exportar. Gere o relatório primeiro.")
      return
    }

    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(toRows(demands))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Relatório")
      XLSX.writeFile(wb, "relatorio.xlsx")
    } else if (format === "csv") {
      const ws = XLSX.utils.json_to_sheet(toRows(demands))
      const csv = XLSX.utils.sheet_to_csv(ws)
      downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "relatorio.csv")
    } else if (format === "json") {
      downloadBlob(
        new Blob([JSON.stringify(toRows(demands), null, 2)], { type: "application/json" }),
        "relatorio.json"
      )
    } else if (format === "pdf") {
      const doc = new jsPDF()
      doc.setFontSize(14)
      doc.text("Relatório de Demandas", 14, 15)
      doc.setFontSize(9)
      let y = 25
      toRows(demands).forEach((row) => {
        const line = `${row.Data} | ${row["Nome do Analista"]} | ${row["Horas Executadas"]} | ${row.Demanda} | ${row.Descricao} | ${row.Solicitante} | ${row.Setor} | ${row.Cliente}`
        doc.text(line, 14, y, { maxWidth: 180 })
        y += 7
        if (y > 280) {
          doc.addPage()
          y = 20
        }
      })
      doc.save("relatorio.pdf")
    }

    toast.success(`Relatório exportado como ${format.toUpperCase()}!`)

    apiMutate("/api/exports", {
      method: "POST",
      body: JSON.stringify({ type: "demand_report", format: format.toUpperCase(), filters }),
    })
      .then(() => mutateList("/api/exports"))
      .catch(() => {})
  }

  function printReport() {
    window.print()
  }

  return { exportReport, printReport }
}
