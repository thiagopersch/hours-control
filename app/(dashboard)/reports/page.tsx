"use client"

import { useReportFilters, useReportData } from "./hooks/use-reports"
import { useReportExport } from "./hooks/use-report-export"
import { ReportFiltersCard } from "./ui/report-filters"
import { ReportPreview } from "./ui/report-preview"

export default function ReportsPage() {
  const { filters, setFilter, appliedFilters, generate } = useReportFilters()
  const { demands, clients, analysts } = useReportData(appliedFilters)
  const { exportReport, printReport } = useReportExport()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Gere e exporte relatórios do sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ReportFiltersCard
          filters={filters}
          setFilter={setFilter}
          clients={clients.data ?? []}
          analysts={analysts.data ?? []}
          onGenerate={generate}
          onExport={(format) => exportReport(format, demands.data ?? [])}
          onPrint={printReport}
        />

        <ReportPreview
          applied={!!appliedFilters}
          isLoading={demands.isLoading}
          error={demands.error}
          demands={demands.data}
        />
      </div>
    </div>
  )
}
