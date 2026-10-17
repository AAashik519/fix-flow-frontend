import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  useGetRepairsReportQuery,
  useGetPaymentsReportQuery,
  useGetInventoryReportQuery,
} from '../../services/api/reportsApi'
import { formatMoney } from '../../lib/utils'

export default function ReportsPage() {
  const repairs = useGetRepairsReportQuery({})
  const payments = useGetPaymentsReportQuery({})
  const inventory = useGetInventoryReportQuery()

  const exportCsv = (type) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
    window.open(`${base}/reports/export?type=${type}`, '_blank')
  }

  if (repairs.isLoading || payments.isLoading) return <LoadingState />

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Operational and financial summaries"
        actions={
          <>
            <Button variant="outline" onClick={() => exportCsv('repairs')}>
              Export repairs CSV
            </Button>
            <Button variant="outline" onClick={() => exportCsv('payments')}>
              Export payments CSV
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Repairs</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {(repairs.data?.data || []).length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {formatMoney((payments.data?.data || []).reduce((s, p) => s + (p.amount || 0), 0))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory SKUs</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {(inventory.data?.data?.items || []).length}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
