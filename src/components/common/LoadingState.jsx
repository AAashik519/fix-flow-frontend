export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-ink-500">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <span>{label}</span>
      </div>
    </div>
  )
}
