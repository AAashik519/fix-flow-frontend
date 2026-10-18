import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useGetRepairTicketsQuery } from '../../services/api/repairTicketsApi'

export default function TechnicianRepairsPage() {
  const { data, isLoading } = useGetRepairTicketsQuery({ assignedToMe: true, limit: 50 })
  if (isLoading) return <LoadingState variant="page" />
  return (
    <div>
      <PageHeader title="Assigned repairs" />
      <div className="space-y-2">
        {(data?.data || []).map((t) => (
          <Link
            key={t._id}
            to={`/technician/repairs/${t._id}`}
            className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 text-sm hover:bg-brand-50/40"
          >
            <div>
              <div className="font-medium">{t.ticketNumber}</div>
              <div className="text-ink-500">
                {t.customerId?.name} · {t.problemDescription}
              </div>
            </div>
            <StatusBadge status={t.status} />
          </Link>
        ))}
      </div>
    </div>
  )
}
