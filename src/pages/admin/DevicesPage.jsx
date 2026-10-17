import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useGetDevicesQuery, useCreateDeviceMutation } from '../../services/api/devicesApi'
import { useGetCustomersQuery } from '../../services/api/customersApi'

const schema = z.object({
  customerId: z.string().min(1),
  category: z.enum(['MOBILE', 'LAPTOP', 'DESKTOP', 'TABLET', 'OTHER']),
  brand: z.string().min(1),
  model: z.string().min(1),
  serialOrImei: z.string().optional(),
  intakeCondition: z.string().optional(),
  reportedProblem: z.string().optional(),
})

export default function DevicesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetDevicesQuery({ search: search || undefined })
  const customers = useGetCustomersQuery({ limit: 100 })
  const [createDevice, { isLoading: saving }] = useCreateDeviceMutation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: 'MOBILE' },
  })

  const onSubmit = async (values) => {
    try {
      await createDevice(values).unwrap()
      toast.success('Device registered')
      reset({ category: 'MOBILE' })
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <PageHeader title="Devices" description="Devices received for repair" />
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 grid gap-3 rounded-xl border border-line bg-panel p-4 md:grid-cols-3">
        <div className="space-y-1 md:col-span-1">
          <Label>Customer</Label>
          <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('customerId')}>
            <option value="">Select customer</option>
            {(customers.data?.data || []).map((c) => (
              <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>
            ))}
          </select>
          {errors.customerId ? <p className="text-xs text-red-600">{errors.customerId.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <select className="h-10 w-full rounded-lg border border-line px-3 text-sm" {...register('category')}>
            {['MOBILE','LAPTOP','DESKTOP','TABLET','OTHER'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1"><Label>Brand</Label><Input {...register('brand')} /></div>
        <div className="space-y-1"><Label>Model</Label><Input {...register('model')} /></div>
        <div className="space-y-1"><Label>Serial / IMEI</Label><Input {...register('serialOrImei')} /></div>
        <div className="space-y-1"><Label>Reported problem</Label><Input {...register('reportedProblem')} /></div>
        <div className="md:col-span-3"><Button disabled={saving}>Register device</Button></div>
      </form>
      <Input className="mb-4" placeholder="Search devices..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {isLoading ? <LoadingState /> : null}
      {!isLoading && !(data?.data || []).length ? <EmptyState title="No devices" /> : null}
      <div className="space-y-2">
        {(data?.data || []).map((d) => (
          <div key={d._id} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
            <div className="font-medium">{d.brand} {d.model} · {d.category}</div>
            <div className="text-ink-500">{d.customerId?.name || 'Customer'} · {d.serialOrImei || 'No serial'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
