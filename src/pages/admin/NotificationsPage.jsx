import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../services/api/notificationsApi'
import { formatDate } from '../../lib/utils'

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery()
  const [markRead] = useMarkNotificationReadMutation()
  const [markAll] = useMarkAllNotificationsReadMutation()
  const navigate = useNavigate()

  if (isLoading) return <LoadingState />
  const items = data?.data?.items || []

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${data?.data?.unreadCount || 0} unread`}
        actions={
          <Button variant="outline" onClick={() => markAll()}>
            Mark all read
          </Button>
        }
      />
      <div className="space-y-2">
        {items.map((n) => (
          <button
            key={n._id}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
              n.isRead ? 'border-line bg-panel' : 'border-brand-200 bg-brand-50'
            }`}
            onClick={async () => {
              if (!n.isRead) await markRead(n._id)
              if (n.relatedTicketId) navigate(`/repair-tickets/${n.relatedTicketId}`)
            }}
          >
            <div className="font-medium">{n.title}</div>
            <div className="text-ink-500">{n.message}</div>
            <div className="mt-1 text-xs text-ink-500">{formatDate(n.createdAt)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
