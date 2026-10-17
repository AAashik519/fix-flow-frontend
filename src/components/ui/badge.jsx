import { cn } from '../../lib/utils'

const tones = {
  default: 'bg-ink-900/10 text-ink-900',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-sky-100 text-sky-800',
  brand: 'bg-brand-100 text-brand-800',
}

export function Badge({ className, tone = 'default', ...props }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  )
}
