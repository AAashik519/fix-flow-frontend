import { Badge } from '../ui/badge'

const map = {
  RECEIVED: 'info',
  DIAGNOSING: 'brand',
  WAITING_FOR_APPROVAL: 'warning',
  WAITING_FOR_PARTS: 'warning',
  IN_PROGRESS: 'brand',
  COMPLETED: 'success',
  READY_FOR_PICKUP: 'success',
  DELIVERED: 'default',
  CANCELLED: 'danger',
  UNPAID: 'danger',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
  REFUNDED: 'default',
  PARTIALLY_REFUNDED: 'warning',
}

export function StatusBadge({ status }) {
  return <Badge tone={map[status] || 'default'}>{String(status || '').replaceAll('_', ' ')}</Badge>
}
