"use client"

import { useState, type RefObject } from "react"
import * as XLSX from "xlsx"
import { toPng } from "html-to-image"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type ExportButtonProps = {
  monthlyData: { name: string; horas: number; demandas: number }[]
  statusData: { name: string; value: number }[]
  clientData: { name: string; horas: number }[]
  analystData: { name: string; horas: number }[]
  chartRefs: RefObject<HTMLDivElement | null>[]
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  link.click()
}

export function DashboardExportButton({
  monthlyData,
  statusData,
  clientData,
  analystData,
  chartRefs,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyData), "Evolucao Mensal")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statusData), "Demandas por Status")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientData), "Top Clientes")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analystData), "Top Analistas")
      XLSX.writeFile(wb, "dashboard.xlsx")

      let imagesExported = 0
      for (const ref of chartRefs) {
        if (!ref.current) continue
        const dataUrl = await toPng(ref.current, { backgroundColor: "#ffffff" })
        downloadDataUrl(dataUrl, `grafico-${imagesExported + 1}.png`)
        imagesExported++
      }

      if (imagesExported < chartRefs.length) {
        toast.info("Alguns gráficos estavam em modo tabela e não foram exportados como imagem.")
      }
      toast.success("Exportação concluída!")
    } catch {
      toast.error("Erro ao exportar dashboard")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={exporting}>
      {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      Exportar
    </Button>
  )
}
