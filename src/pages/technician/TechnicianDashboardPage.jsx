import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useGetRepairTicketsQuery } from '../../services/api/repairTicketsApi'
import { useGetDashboardOverviewQuery } from '../../services/api/dashboardApi'

export default function TechnicianDashboardPage() {
  const tickets = useGetRepairTicketsQuery({ assignedToMe: true, limit: 10 })
  const overview = useGetDashboardOverviewQuery()
  if (tickets.isLoading) return <LoadingState />
  const active = (tickets.data?.data || []).filter(
    (t) => !['DELIVERED', 'CANCELLED'].includes(t.status),
  )

  return (
    <div>
      <PageHeader title="Technician dashboard" description="Your assigned repair workload" />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="text-sm text-ink-500">Assigned active</div>
            <div className="text-2xl font-bold">{active.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-sm text-ink-500">In progress (shop)</div>
            <div className="text-2xl font-bold">
              {overview.data?.data?.repairsInProgress ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-sm text-ink-500">Waiting for parts</div>
            <div className="text-2xl font-bold">
              {overview.data?.data?.repairsWaitingForParts ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(tickets.data?.data || []).map((t) => (
            <Link
              key={t._id}
              to={`/technician/repairs/${t._id}`}
              className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:bg-brand-50/50"
            >
              <span>
                {t.ticketNumber} · {t.deviceId?.brand} {t.deviceId?.model}
              </span>
              <StatusBadge status={t.status} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
