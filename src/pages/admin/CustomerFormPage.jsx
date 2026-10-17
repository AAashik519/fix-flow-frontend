import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  useCreateCustomerMutation,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} from '../../services/api/customersApi'

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export default function CustomerFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { data } = useGetCustomerQuery(id, { skip: !isEdit })
  const [createCustomer, createState] = useCreateCustomerMutation()
  const [updateCustomer, updateState] = useUpdateCustomerMutation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (data?.data) reset(data.data)
  }, [data, reset])

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await updateCustomer({ id, ...values }).unwrap()
        toast.success('Customer updated')
        navigate(`/customers/${id}`)
      } else {
        const res = await createCustomer(values).unwrap()
        toast.success('Customer created')
        navigate(`/customers/${res.data._id}`)
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? 'Edit customer' : 'New customer'} />
      <form className="space-y-4 rounded-xl border border-line bg-panel p-5" onSubmit={handleSubmit(onSubmit)}>
        {['name', 'phone', 'email', 'address'].map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{field}</Label>
            <Input id={field} {...register(field)} />
            {errors[field] ? <p className="text-xs text-red-600">{errors[field].message}</p> : null}
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register('notes')} />
        </div>
        <Button disabled={createState.isLoading || updateState.isLoading}>Save</Button>
      </form>
    </div>
  )
}
