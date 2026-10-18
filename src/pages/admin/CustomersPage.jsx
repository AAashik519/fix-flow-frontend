import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useGetCustomersQuery } from '../../services/api/customersApi'
import { formatDate } from '../../lib/utils'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching } = useGetCustomersQuery({ search: search || undefined, page, limit: 10 })

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Search and manage shop customers"
        actions={<Button asChild><Link to="/customers/new">Add customer</Link></Button>}
      />
      <div className="mb-4">
        <Input placeholder="Search name, phone, email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>
      {isLoading ? <LoadingState /> : null}
      {!isLoading && !(data?.data || []).length ? (
        <EmptyState title="No customers yet" description="Create your first customer to start intake." action={<Button asChild><Link to="/customers/new">Add customer</Link></Button>} />
      ) : null}
      {(data?.data || []).length ? (
        <div className="overflow-x-auto rounded-xl border border-line bg-panel">
          <table className="min-w-full text-sm">
            <thead className="bg-surface text-left text-ink-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((c) => (
                <tr key={c._id} className="border-t border-line hover:bg-brand-50/40">
                  <td className="px-4 py-3"><Link className="font-medium text-brand-700" to={`/customers/${c._id}`}>{c.name}</Link></td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.email || '—'}</td>
                  <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/customers/${c._id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
            <span className="text-ink-500">{isFetching ? 'Updating...' : `Page ${data?.meta?.page} of ${data?.meta?.totalPages || 1}`}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
