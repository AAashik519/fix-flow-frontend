import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useGetCustomerQuery, useGetCustomerRepairHistoryQuery } from '../../services/api/customersApi'
import { formatMoney } from '../../lib/utils'

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const { data, isLoading } = useGetCustomerQuery(id)
  const history = useGetCustomerRepairHistoryQuery(id)
  if (isLoading) return <LoadingState />
  const c = data?.data
  const h = history.data?.data

  return (
    <div>
      <PageHeader
        title={c?.name}
        description={c?.phone}
        actions={<Button asChild variant="outline"><Link to={`/customers/${id}/edit`}>Edit</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Email: {c?.email || '—'}</div>
            <div>Address: {c?.address || '—'}</div>
            <div>Notes: {c?.notes || '—'}</div>
            <div>Total repairs: {h?.totalRepairs ?? 0}</div>
            <div>Outstanding: {formatMoney(h?.outstandingBalance)}</div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Repair history</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(h?.tickets || []).map((t) => (
              <Link key={t._id} to={`/repair-tickets/${t._id}`} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:bg-brand-50/50">
                <span>{t.ticketNumber}</span>
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
