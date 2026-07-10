import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex h-full w-16 flex-col border-r bg-card">
        <div className="flex h-14 items-center justify-center border-b px-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <div className="flex flex-1 flex-col gap-3 px-3 py-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header skeleton */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded md:hidden" />
            <Skeleton className="h-5 w-36 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>

        {/* Page content skeleton */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Page title */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-8 w-48 rounded" />
                <Skeleton className="h-4 w-72 rounded" />
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* Filters / toolbar */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-64 rounded-md" />
              <Skeleton className="h-10 w-28 rounded-md" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border bg-card">
              {/* Table header */}
              <div className="flex items-center gap-4 border-b px-4 py-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-4 rounded"
                    style={{ width: `${[15, 25, 20, 15, 10][i]}%` }}
                  />
                ))}
              </div>

              {/* Table rows */}
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
                >
                  {Array.from({ length: 5 }).map((_, colIdx) => (
                    <Skeleton
                      key={colIdx}
                      className="h-4 rounded"
                      style={{
                        width: `${[15, 25, 20, 15, 10][colIdx]}%`,
                        opacity: 1 - rowIdx * 0.08,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
