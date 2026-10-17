export function EmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-panel/70 p-8 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-ink-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
