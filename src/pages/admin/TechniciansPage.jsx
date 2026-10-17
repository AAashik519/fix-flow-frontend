import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useCreateTechnicianMutation, useGetTechniciansQuery } from '../../services/api/techniciansApi'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export default function TechniciansPage() {
  const { data, isLoading } = useGetTechniciansQuery()
  const [createTech, { isLoading: saving }] = useCreateTechnicianMutation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    try {
      await createTech(values).unwrap()
      toast.success('Technician created')
      reset()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <PageHeader title="Technicians" description="Staff accounts invited by the shop owner" />
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 grid gap-3 rounded-xl border border-line bg-panel p-4 md:grid-cols-4">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input {...register('name')} />
          {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
        </div>
        <div className="space-y-1">
          <Label>Password</Label>
          <Input type="password" {...register('password')} />
        </div>
        <div className="flex items-end">
          <Button disabled={saving}>Add technician</Button>
        </div>
      </form>
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="space-y-2">
          {(data?.data || []).map((t) => (
            <div key={t._id} className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-ink-500">{t.email}</div>
              </div>
              <div className={t.isActive ? 'text-emerald-700' : 'text-red-600'}>
                {t.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
