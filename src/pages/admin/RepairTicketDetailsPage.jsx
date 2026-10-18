import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  useGetRepairTicketQuery,
  useUpdateRepairStatusMutation,
  useAssignTechnicianMutation,
  useAddDiagnosticsMutation,
  useAddNoteMutation,
  useAddPartsMutation,
} from '../../services/api/repairTicketsApi'
import { useGetTechniciansQuery } from '../../services/api/techniciansApi'
import { useGetInventoryQuery } from '../../services/api/inventoryApi'
import { useCreatePaymentMutation, useGetTicketPaymentsQuery } from '../../services/api/paymentsApi'
import { useMeQuery } from '../../services/api/authApi'
import { assetUrl, formatDate, formatMoney, idempotencyKey } from '../../lib/utils'

const NEXT = {
  RECEIVED: ['DIAGNOSING', 'CANCELLED'],
  DIAGNOSING: ['WAITING_FOR_APPROVAL', 'WAITING_FOR_PARTS', 'IN_PROGRESS', 'CANCELLED'],
  WAITING_FOR_APPROVAL: ['WAITING_FOR_PARTS', 'IN_PROGRESS', 'CANCELLED'],
  WAITING_FOR_PARTS: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_PARTS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'CANCELLED'],
  COMPLETED: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export default function RepairTicketDetailsPage() {
  const { id } = useParams()
  const { data: me } = useMeQuery()
  const isAdmin = me?.data?.role === 'ADMIN'
  const { data, isLoading, refetch } = useGetRepairTicketQuery(id)
  const payments = useGetTicketPaymentsQuery(id, { skip: !isAdmin })
  const techs = useGetTechniciansQuery(undefined, { skip: !isAdmin })
  const inventory = useGetInventoryQuery({ limit: 100 }, { skip: !isAdmin && me?.data?.role !== 'TECHNICIAN' })
  const [updateStatus, statusState] = useUpdateRepairStatusMutation()
  const [assignTechnician, assignState] = useAssignTechnicianMutation()
  const [addDiagnostics, diagState] = useAddDiagnosticsMutation()
  const [addNote, noteState] = useAddNoteMutation()
  const [addParts, partsState] = useAddPartsMutation()
  const [createPayment, payState] = useCreatePaymentMutation()

  const [status, setStatus] = useState('')
  const [techId, setTechId] = useState('')
  const [diag, setDiag] = useState('')
  const [note, setNote] = useState('')
  const [customerVisible, setCustomerVisible] = useState(false)
  const [partId, setPartId] = useState('')
  const [partQty, setPartQty] = useState(1)
  const [payAmount, setPayAmount] = useState('')

  if (isLoading) return <LoadingState />
  const t = data?.data
  if (!t) return <div>Ticket not found</div>

  const nextStatuses = NEXT[t.status] || []

  const run = async (fn, success) => {
    try {
      await fn()
      toast.success(success)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed')
    }
  }

  return (
    <div>
      <PageHeader
        title={t.ticketNumber}
        description={t.problemDescription}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={t.status} />
            {isAdmin ? (
              <Button asChild variant="outline">
                <Link to={`/repair-tickets/${id}/edit`}>Edit ticket</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>Customer: {t.customerId?.name} ({t.customerId?.phone})</div>
            <div>Device: {t.deviceId?.brand} {t.deviceId?.model}</div>
            <div>Technician: {t.technicianId?.name || 'Unassigned'}</div>
            <div>Priority: {t.priority}</div>
            <div>Total: {formatMoney(t.total)}</div>
            <div>Paid: {formatMoney(t.totalPaid)}</div>
            <div>Outstanding: {formatMoney(t.outstandingBalance)}</div>
            <div>Payment: <StatusBadge status={t.paymentStatus} /></div>
            <div className="sm:col-span-2">Diagnostics: {t.diagnosticFindings || '—'}</div>
            {(t.deviceId?.photoUrls || []).length ? (
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                {t.deviceId.photoUrls.map((url) => (
                  <img
                    key={url}
                    src={assetUrl(url)}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-line object-cover"
                  />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Update status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Select next status</option>
              {nextStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button
              type="button"
              className="w-full"
              loading={statusState.isLoading}
              loadingText="Submitting…"
              disabled={!status}
              onClick={() => run(() => updateStatus({ id, status }).unwrap(), 'Status updated')}
            >
              Apply status
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {isAdmin ? (
          <Card>
            <CardHeader><CardTitle>Assign technician</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <select className="h-10 flex-1 rounded-lg border border-line px-3 text-sm" value={techId} onChange={(e) => setTechId(e.target.value)}>
                <option value="">Select</option>
                {(techs.data?.data || []).map((tech) => (
                  <option key={tech._id} value={tech._id}>{tech.name}</option>
                ))}
              </select>
              <Button type="button" loading={assignState.isLoading} loadingText="Saving…" disabled={!techId} onClick={() => run(() => assignTechnician({ id, technicianId: techId }).unwrap(), 'Assigned')}>
                Assign
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader><CardTitle>Diagnostics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Textarea value={diag} onChange={(e) => setDiag(e.target.value)} placeholder="Findings..." />
            <Button
              type="button"
              loading={diagState.isLoading}
              loadingText="Saving…"
              disabled={!diag}
              onClick={() => run(() => addDiagnostics({ id, diagnosticFindings: diag }).unwrap(), 'Diagnostics saved')}
            >
              Save diagnostics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={customerVisible} onChange={(e) => setCustomerVisible(e.target.checked)} />
              Visible to customer
            </label>
            <Button
              type="button"
              loading={noteState.isLoading}
              loadingText="Saving…"
              disabled={!note}
              onClick={() => run(() => addNote({ id, body: note, customerVisible }).unwrap(), 'Note added')}
            >
              Add note
            </Button>
            <div className="space-y-2 pt-2">
              {(t.notes || []).map((n, i) => (
                <div key={i} className="rounded-lg border border-line p-2 text-sm">
                  <div>{n.body}</div>
                  <div className="text-xs text-ink-500">{formatDate(n.createdAt)} {n.customerVisible ? '· customer visible' : '· internal'}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Parts used</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <select className="h-10 flex-1 rounded-lg border border-line px-3 text-sm" value={partId} onChange={(e) => setPartId(e.target.value)}>
                <option value="">Select part</option>
                {(inventory.data?.data || []).map((item) => (
                  <option key={item._id} value={item._id}>{item.name} ({item.quantity})</option>
                ))}
              </select>
              <Input className="w-20" type="number" min={1} value={partQty} onChange={(e) => setPartQty(Number(e.target.value))} />
            </div>
            <Button
              type="button"
              loading={partsState.isLoading}
              loadingText="Saving…"
              disabled={!partId}
              onClick={() =>
                run(
                  () =>
                    addParts({
                      id,
                      inventoryItemId: partId,
                      quantity: partQty,
                      idempotencyKey: idempotencyKey('part'),
                    }).unwrap(),
                  'Part added',
                )
              }
            >
              Consume part
            </Button>
            <div className="space-y-1 pt-2 text-sm">
              {(t.partsUsed || []).map((p, i) => (
                <div key={i} className="flex justify-between border-b border-line py-1">
                  <span>{p.name} × {p.quantity}</span>
                  <span>{formatMoney(p.lineTotal)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <Card className="mt-4">
          <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex max-w-md gap-2">
              <div className="flex-1 space-y-1">
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <Button
                type="button"
                className="self-end"
                loading={payState.isLoading}
                loadingText="Submitting…"
                disabled={!payAmount}
                onClick={() =>
                  run(
                    () =>
                      createPayment({
                        repairTicketId: id,
                        amount: Number(payAmount),
                        method: 'CASH',
                        idempotencyKey: idempotencyKey('pay'),
                      }).unwrap(),
                    'Payment recorded',
                  )
                }
              >
                Record payment
              </Button>
            </div>
            {(payments.data?.data || []).map((p) => (
              <div key={p._id} className="flex justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span>{formatMoney(p.amount)} · {p.method}</span>
                <span>{formatDate(p.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="mt-4">
        <CardHeader><CardTitle>Status history</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(t.statusHistory || []).map((h, i) => (
            <div key={i} className="border-l-2 border-brand-300 pl-3 text-sm">
              <div className="font-medium">{h.previousStatus} → {h.newStatus}</div>
              <div className="text-ink-500">{formatDate(h.changedAt)} · {h.changedBy?.name || 'Staff'}</div>
              {h.note ? <div>{h.note}</div> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
