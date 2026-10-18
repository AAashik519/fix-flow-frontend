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

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

/** Resolve uploaded asset paths (e.g. /uploads/devices/x.jpg) to a full URL. */
export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path
  const origin = apiBase.replace(/\/api\/v1\/?$/, '')
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
