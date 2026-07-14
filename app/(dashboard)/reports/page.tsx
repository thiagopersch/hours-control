"use client"

import { useReportFilters, useReportData } from "./hooks/use-reports"
import { useReportExport } from "./hooks/use-report-export"
import { ReportFiltersCard } from "./ui/report-filters"
import { ReportPreview } from "./ui/report-preview"
import { ReportHistory } from "./ui/report-history"

export default function ReportsPage() {
  const { filters, setFilter, appliedFilters, generate } = useReportFilters()
  const { demands, clients, analysts } = useReportData(appliedFilters)
  const { exportReport, printReport } = useReportExport()

  const hasResults = !!appliedFilters && !demands.isLoading && !demands.error && (demands.data?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Gere e exporte relatórios do sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <ReportFiltersCard
            filters={filters}
            setFilter={setFilter}
            clients={clients.data ?? []}
            analysts={analysts.data ?? []}
            onGenerate={generate}
            onExport={(format) => exportReport(format, demands.data ?? [], appliedFilters)}
            onPrint={printReport}
            generating={!!appliedFilters && demands.isLoading}
            canPrint={hasResults}
          />
          <ReportHistory />
        </div>

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
