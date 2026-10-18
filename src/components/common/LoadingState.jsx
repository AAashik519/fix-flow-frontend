function Bone({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-black/10 ${className}`} />
}

function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="grid gap-4 bg-surface px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Bone key={i} className="h-3 w-16" />
        ))}
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid items-center gap-4 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, col) => (
              <Bone key={col} className={col === 0 ? 'h-4 w-28' : 'h-4 w-20'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ListSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3">
          <div className="space-y-2">
            <Bone className="h-4 w-40" />
            <Bone className="h-3 w-56" />
          </div>
          <Bone className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Bone className="h-8 w-56" />
        <Bone className="h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Bone className="h-24" />
        <Bone className="h-24" />
        <Bone className="h-24" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  )
}

function Spinner({ label }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-ink-500">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <span>{label}</span>
      </div>
    </div>
  )
}

export function LoadingState({ variant = 'table', rows = 6, columns = 5, label = 'Loading...' }) {
  if (variant === 'spinner') return <Spinner label={label} />
  if (variant === 'page') return <PageSkeleton />
  if (variant === 'list') return <ListSkeleton rows={rows} />
  return <TableSkeleton rows={rows} columns={columns} />
}
