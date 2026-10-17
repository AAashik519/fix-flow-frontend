import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value, currency = 'BDT') {
  const num = Number(value || 0)
  return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export function idempotencyKey(prefix = 'ff') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
