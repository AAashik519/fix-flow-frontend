import { PageHeader } from '../../components/common/PageHeader'
import { Card, CardContent } from '../../components/ui/card'
import { useMeQuery } from '../../services/api/authApi'
import { LoadingState } from '../../components/common/LoadingState'

export default function ProfilePage() {
  const { data, isLoading } = useMeQuery()
  if (isLoading) return <LoadingState variant="page" />
  const user = data?.data
  return (
    <div>
      <PageHeader title="Profile" description="Your account details" />
      <Card>
        <CardContent className="space-y-2 pt-5">
          <div><span className="text-ink-500">Name:</span> {user?.name}</div>
          <div><span className="text-ink-500">Email:</span> {user?.email}</div>
          <div><span className="text-ink-500">Role:</span> {user?.role}</div>
          <div><span className="text-ink-500">Shop:</span> {user?.shop?.name}</div>
        </CardContent>
      </Card>
    </div>
  )
}
