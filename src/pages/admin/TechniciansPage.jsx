import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useCreateTechnicianMutation, useGetTechniciansQuery, useUpdateTechnicianMutation } from '../../services/api/techniciansApi'

const EMPTY_TECH = { name: '', email: '', password: '' }

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function TechniciansPage() {
  const { data, isLoading } = useGetTechniciansQuery()
  const [createTech, { isLoading: saving }] = useCreateTechnicianMutation()
  const [updateTech, { isLoading: updating }] = useUpdateTechnicianMutation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_TECH,
  })

  const onSubmit = async (values) => {
    try {
      await createTech(values).unwrap()
      toast.success('Technician created')
      reset(EMPTY_TECH)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const toggleActive = async (tech) => {
    try {
      await updateTech({ id: tech._id, isActive: !tech.isActive }).unwrap()
      toast.success(tech.isActive ? 'Technician deactivated' : 'Technician activated')
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
          <Input type="email" autoComplete="off" {...register('email')} />
          {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label>Password</Label>
          <Input type="password" autoComplete="new-password" {...register('password')} />
          {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
        </div>
        <div className="flex items-end">
          <Button type="submit" loading={saving} loadingText="Saving…">Add technician</Button>
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
              <div className="flex items-center gap-3">
                <span className={t.isActive ? 'text-emerald-700' : 'text-red-600'}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
                <Button type="button" size="sm" variant="outline" loading={updating} loadingText="Saving…" onClick={() => toggleActive(t)}>
                  {t.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
