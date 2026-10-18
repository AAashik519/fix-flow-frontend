import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { useGetPaymentsQuery } from '../../services/api/paymentsApi'
import { formatDate, formatMoney } from '../../lib/utils'

export default function PaymentsPage() {
  const { data, isLoading } = useGetPaymentsQuery({ limit: 50 })
  if (isLoading) return <LoadingState variant="page" />
  return (
    <div>
      <PageHeader title="Payments" description="Successful payment records" />
      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="min-w-full text-sm">
          <thead className="bg-surface text-left text-ink-500">
            <tr>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data || []).map((p) => (
              <tr key={p._id} className="border-t border-line">
                <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3">
                  {p.repairTicketId?.ticketNumber || p.repairTicketId}
                </td>
                <td className="px-4 py-3">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
