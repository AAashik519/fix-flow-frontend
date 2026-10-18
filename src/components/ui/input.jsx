import * as React from 'react'
import { cn } from '../../lib/utils'

export const Input = React.forwardRef(({ className, type, onWheel, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-10 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none ring-brand-500 placeholder:text-ink-500 focus:ring-2',
      className,
    )}
    ref={ref}
    onWheel={(e) => {
      if (type === 'number') e.currentTarget.blur()
      onWheel?.(e)
    }}
    {...props}
  />
))
Input.displayName = 'Input'
