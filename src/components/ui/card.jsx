import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-xl border border-line bg-panel shadow-sm', className)} {...props} />
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-2', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-display text-lg font-semibold', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-2', className)} {...props} />
}
