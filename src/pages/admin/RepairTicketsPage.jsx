import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useGetRepairTicketsQuery } from '../../services/api/repairTicketsApi'
import { formatMoney } from '../../lib/utils'

export default function RepairTicketsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const { data, isLoading } = useGetRepairTicketsQuery({
    search: search || undefined,
    status: status || undefined,
  })

  return (
    <div>
      <PageHeader
        title="Repair tickets"
        description="Track every device through the repair lifecycle"
        actions={<Button asChild><Link to="/repair-tickets/new">New ticket</Link></Button>}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search ticket #, customer, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="h-10 rounded-lg border border-line px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['RECEIVED','DIAGNOSING','WAITING_FOR_APPROVAL','WAITING_FOR_PARTS','IN_PROGRESS','COMPLETED','READY_FOR_PICKUP','DELIVERED','CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {isLoading ? <LoadingState /> : null}
      {!isLoading && !(data?.data || []).length ? (
        <EmptyState title="No repair tickets" action={<Button asChild><Link to="/repair-tickets/new">Create ticket</Link></Button>} />
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="min-w-full text-sm">
          <thead className="bg-surface text-left text-ink-500">
            <tr>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data || []).map((t) => (
              <tr key={t._id} className="border-t border-line">
                <td className="px-4 py-3"><Link className="font-medium text-brand-700" to={`/repair-tickets/${t._id}`}>{t.ticketNumber}</Link></td>
                <td className="px-4 py-3">{t.customerId?.name}</td>
                <td className="px-4 py-3">{t.deviceId?.brand} {t.deviceId?.model}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3">{formatMoney(t.outstandingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
