import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"

export function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="mt-2 h-9 w-16" />
    </div>
  )
}
