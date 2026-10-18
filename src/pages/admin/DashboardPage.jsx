import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  useGetDashboardOverviewQuery,
  useGetRepairStatisticsQuery,
  useGetRevenueStatisticsQuery,
  useGetTechnicianWorkloadQuery,
} from '../../services/api/dashboardApi'
import { formatMoney } from '../../lib/utils'

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="text-sm text-ink-500">{label}</div>
        <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const overview = useGetDashboardOverviewQuery()
  const repairs = useGetRepairStatisticsQuery()
  const revenue = useGetRevenueStatisticsQuery()
  const workload = useGetTechnicianWorkloadQuery()

  if (overview.isLoading) return <LoadingState variant="page" />
  const o = overview.data?.data || {}

  return (
    <div>
      <PageHeader title="Dashboard" description="Live shop performance from MongoDB aggregates" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total tickets" value={o.totalRepairTickets ?? 0} />
        <StatCard label="Received today" value={o.repairsReceivedToday ?? 0} />
        <StatCard label="In progress" value={o.repairsInProgress ?? 0} />
        <StatCard label="Waiting for parts" value={o.repairsWaitingForParts ?? 0} />
        <StatCard label="Completed" value={o.completedRepairs ?? 0} />
        <StatCard label="Ready for pickup" value={o.readyForPickup ?? 0} />
        <StatCard label="Low stock items" value={o.lowStockItems ?? 0} />
        <StatCard label="Revenue collected" value={formatMoney(o.revenueCollected)} />
        <StatCard label="Outstanding balances" value={formatMoney(o.outstandingBalances)} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Repairs by status</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repairs.data?.data?.byStatus || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#286855" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue by day</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue.data?.data?.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#35826b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Technician workload</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(workload.data?.data || []).length === 0 ? (
            <p className="text-sm text-ink-500">No active assignments</p>
          ) : (
            (workload.data?.data || []).map((t) => (
              <div key={t.technicianId} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span>{t.name}</span>
                <span className="font-medium">{t.activeTickets} active</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
