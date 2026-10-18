import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { useGetCustomersQuery } from '../../services/api/customersApi'
import { useGetDevicesQuery } from '../../services/api/devicesApi'
import { useGetTechniciansQuery } from '../../services/api/techniciansApi'
import {
  useCreateRepairTicketMutation,
  useGetRepairTicketQuery,
  useUpdateRepairTicketMutation,
  useAssignTechnicianMutation,
} from '../../services/api/repairTicketsApi'

const createSchema = z.object({
  customerId: z.string().min(1),
  deviceId: z.string().min(1),
  problemDescription: z.string().min(3),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  technicianId: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  laborCharge: z.coerce.number().min(0).optional(),
  depositAmount: z.coerce.number().min(0).optional(),
})

const updateSchema = z.object({
  problemDescription: z.string().min(3),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  technicianId: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  laborCharge: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  approvedEstimate: z.coerce.number().min(0).optional(),
  customerApproved: z.boolean().optional(),
})

export default function RepairTicketFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const customers = useGetCustomersQuery({ limit: 100 }, { skip: isEdit })
  const devices = useGetDevicesQuery({ limit: 100 }, { skip: isEdit })
  const techs = useGetTechniciansQuery()
  const ticketQuery = useGetRepairTicketQuery(id, { skip: !isEdit })
  const [createTicket, { isLoading: creating }] = useCreateRepairTicketMutation()
  const [updateTicket, { isLoading: updating }] = useUpdateRepairTicketMutation()
  const [assignTechnician] = useAssignTechnicianMutation()

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: isEdit
      ? { priority: 'MEDIUM', customerApproved: false }
      : { priority: 'MEDIUM' },
  })

  useEffect(() => {
    if (!isEdit || !ticketQuery.data?.data) return
    const t = ticketQuery.data.data
    reset({
      problemDescription: t.problemDescription || '',
      priority: t.priority || 'MEDIUM',
      technicianId: t.technicianId?._id || t.technicianId || '',
      estimatedCost: t.estimatedCost ?? 0,
      laborCharge: t.laborCharge ?? 0,
      discount: t.discount ?? 0,
      tax: t.tax ?? 0,
      approvedEstimate: t.approvedEstimate ?? 0,
      customerApproved: Boolean(t.customerApproved),
    })
  }, [isEdit, ticketQuery.data, reset])

  const customerId = watch('customerId')
  const filteredDevices = (devices.data?.data || []).filter(
    (d) => !customerId || d.customerId?._id === customerId || d.customerId === customerId,
  )

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        const { technicianId, ...body } = values
        await updateTicket({ id, ...body }).unwrap()
        const currentTechId =
          ticketQuery.data?.data?.technicianId?._id || ticketQuery.data?.data?.technicianId || ''
        if (technicianId && technicianId !== currentTechId) {
          await assignTechnician({ id, technicianId }).unwrap()
        }
        toast.success('Ticket updated')
        navigate(`/repair-tickets/${id}`)
        return
      }

      const payload = { ...values }
      if (!payload.technicianId) delete payload.technicianId
      const res = await createTicket(payload).unwrap()
      toast.success('Ticket created')
      if (res.data.trackingEmailSent) {
        toast.success('Tracking link sent to the customer email')
      } else if (res.data.trackingUrl) {
        toast.message(`Email was not sent. Share this link: ${res.data.trackingUrl}`)
      }
      navigate(`/repair-tickets/${res.data._id}`)
    } catch (err) {
      toast.error(err?.data?.message || (isEdit ? 'Failed to update ticket' : 'Failed to create ticket'))
    }
  }

  if (isEdit && ticketQuery.isLoading) return <LoadingState />
  if (isEdit && !ticketQuery.data?.data) return <div>Ticket not found</div>

  const isLoading = creating || updating

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? 'Edit repair ticket' : 'Create repair ticket'} />
      <form className="space-y-4 rounded-xl border border-line bg-panel p-5" onSubmit={handleSubmit(onSubmit)}>
        {!isEdit ? (
          <>
            <div className="space-y-1">
              <Label>Customer</Label>
              <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('customerId')}>
                <option value="">Select</option>
                {(customers.data?.data || []).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.customerId ? <p className="text-xs text-red-600">{errors.customerId.message}</p> : null}
            </div>
            <div className="space-y-1">
              <Label>Device</Label>
              <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('deviceId')}>
                <option value="">Select</option>
                {filteredDevices.map((d) => (
                  <option key={d._id} value={d._id}>{d.brand} {d.model}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-600">
            {ticketQuery.data.data.ticketNumber} · {ticketQuery.data.data.customerId?.name} ·{' '}
            {ticketQuery.data.data.deviceId?.brand} {ticketQuery.data.data.deviceId?.model}
          </div>
        )}
        <div className="space-y-1">
          <Label>Problem</Label>
          <Textarea {...register('problemDescription')} />
          {errors.problemDescription ? (
            <p className="text-xs text-red-600">{errors.problemDescription.message}</p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Priority</Label>
            <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('priority')}>
              {['LOW','MEDIUM','HIGH','URGENT'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Technician</Label>
            <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('technicianId')}>
              <option value="">Unassigned</option>
              {(techs.data?.data || []).map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1"><Label>Estimated cost</Label><Input type="number" step="0.01" {...register('estimatedCost')} /></div>
          <div className="space-y-1"><Label>Labor charge</Label><Input type="number" step="0.01" {...register('laborCharge')} /></div>
          {!isEdit ? (
            <div className="space-y-1"><Label>Deposit</Label><Input type="number" step="0.01" {...register('depositAmount')} /></div>
          ) : (
            <>
              <div className="space-y-1"><Label>Discount</Label><Input type="number" step="0.01" {...register('discount')} /></div>
              <div className="space-y-1"><Label>Tax</Label><Input type="number" step="0.01" {...register('tax')} /></div>
              <div className="space-y-1"><Label>Approved estimate</Label><Input type="number" step="0.01" {...register('approvedEstimate')} /></div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input type="checkbox" {...register('customerApproved')} />
                Customer approved
              </label>
            </>
          )}
        </div>
        <Button type="submit" loading={isLoading} loadingText={isEdit ? 'Saving…' : 'Submitting…'}>{isEdit ? 'Save changes' : 'Create ticket'}</Button>
      </form>
    </div>
  )
}
