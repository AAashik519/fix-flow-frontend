import * as React from 'react'
import { cn } from '../../lib/utils'

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[90px] w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2',
      className,
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
