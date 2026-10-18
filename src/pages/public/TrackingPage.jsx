import { useParams, Link } from 'react-router-dom'
import { useTrackRepairQuery } from '../../services/api/repairTicketsApi'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { formatDate, formatMoney } from '../../lib/utils'

export default function TrackingPage() {
  const { trackingToken } = useParams()
  const { data, isLoading, isError } = useTrackRepairQuery(trackingToken)

  if (isLoading) return <LoadingState variant="page" />
  if (isError || !data?.data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-bold">Tracking not found</h1>
        <p className="mt-2 text-ink-500">This tracking link is invalid or expired.</p>
        <Link className="mt-4 text-brand-700" to="/">Back home</Link>
      </div>
    )
  }

  const t = data.data
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <div className="mb-6">
        <div className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">FixFlow</div>
        <h1 className="mt-2 font-display text-3xl font-bold">Repair tracking</h1>
        <p className="text-ink-500">Ticket {t.ticketNumber}</p>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Current status</span>
              <StatusBadge status={t.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>{t.device?.brand} {t.device?.model} ({t.device?.category})</div>
            <div className="text-ink-500">{t.problemSummary}</div>
            <div>Payment: <StatusBadge status={t.paymentStatus} /></div>
            {t.estimatedCost != null ? <div>Estimate: {formatMoney(t.estimatedCost)}</div> : null}
            {t.readyForPickup ? <div className="font-medium text-brand-700">Ready for pickup</div> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(t.timeline || []).map((h, i) => (
              <div key={i} className="border-l-2 border-brand-300 pl-3 text-sm">
                <div className="font-medium">{h.status.replaceAll('_', ' ')}</div>
                <div className="text-ink-500">{formatDate(h.changedAt)}</div>
                {h.note ? <div>{h.note}</div> : null}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Shop contact</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div className="font-medium">{t.shop?.name}</div>
            <div>{t.shop?.phone}</div>
            <div>{t.shop?.address}</div>
            <p className="mt-2 text-ink-500">{t.shop?.contactInstructions}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
