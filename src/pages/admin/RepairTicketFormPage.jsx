import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { useGetCustomersQuery } from '../../services/api/customersApi'
import { useGetDevicesQuery } from '../../services/api/devicesApi'
import { useGetTechniciansQuery } from '../../services/api/techniciansApi'
import { useCreateRepairTicketMutation } from '../../services/api/repairTicketsApi'

const schema = z.object({
  customerId: z.string().min(1),
  deviceId: z.string().min(1),
  problemDescription: z.string().min(3),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  technicianId: z.string().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  laborCharge: z.coerce.number().min(0).optional(),
  depositAmount: z.coerce.number().min(0).optional(),
})

export default function RepairTicketFormPage() {
  const navigate = useNavigate()
  const customers = useGetCustomersQuery({ limit: 100 })
  const devices = useGetDevicesQuery({ limit: 100 })
  const techs = useGetTechniciansQuery()
  const [createTicket, { isLoading }] = useCreateRepairTicketMutation()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  })
  const customerId = watch('customerId')
  const filteredDevices = (devices.data?.data || []).filter((d) => !customerId || d.customerId?._id === customerId || d.customerId === customerId)

  const onSubmit = async (values) => {
    try {
      const payload = { ...values }
      if (!payload.technicianId) delete payload.technicianId
      const res = await createTicket(payload).unwrap()
      toast.success('Ticket created')
      if (res.data.trackingToken) {
        toast.message(`Tracking token: ${res.data.trackingToken}`)
      }
      navigate(`/repair-tickets/${res.data._id}`)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create ticket')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create repair ticket" />
      <form className="space-y-4 rounded-xl border border-line bg-panel p-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <Label>Customer</Label>
          <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('customerId')}>
            <option value="">Select</option>
            {(customers.data?.data || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.customerId ? <p className="text-xs text-red-600">{errors.customerId.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label>Device</Label>
          <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('deviceId')}>
            <option value="">Select</option>
            {filteredDevices.map((d) => <option key={d._id} value={d._id}>{d.brand} {d.model}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Problem</Label>
          <Textarea {...register('problemDescription')} />
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
              {(techs.data?.data || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label>Estimated cost</Label><Input type="number" step="0.01" {...register('estimatedCost')} /></div>
          <div className="space-y-1"><Label>Labor charge</Label><Input type="number" step="0.01" {...register('laborCharge')} /></div>
          <div className="space-y-1"><Label>Deposit</Label><Input type="number" step="0.01" {...register('depositAmount')} /></div>
        </div>
        <Button disabled={isLoading}>Create ticket</Button>
      </form>
    </div>
  )
}
