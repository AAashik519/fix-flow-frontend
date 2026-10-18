import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white hover:bg-brand-700',
        secondary: 'bg-ink-900 text-white hover:bg-ink-700',
        outline: 'border border-line bg-panel hover:bg-brand-50',
        ghost: 'hover:bg-brand-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText = 'Saving…',
  disabled,
  onClick,
  type,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button'
  const lock = React.useRef(false)
  const loadingRef = React.useRef(loading)
  loadingRef.current = loading

  React.useEffect(() => {
    if (!loading) lock.current = false
  }, [loading])

  const handleClick = (event) => {
    if (disabled || loading || lock.current) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    lock.current = true
    onClick?.(event)
    window.setTimeout(() => {
      if (!loadingRef.current) lock.current = false
    }, 600)
  }

  if (asChild) {
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? loadingText : children}
    </Comp>
  )
})
Button.displayName = 'Button'
