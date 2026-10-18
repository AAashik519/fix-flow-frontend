import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useGetShopQuery, useUpdateShopMutation } from '../../services/api/shopsApi'

export default function SettingsPage() {
  const { data, isLoading } = useGetShopQuery()
  const [updateShop, { isLoading: saving }] = useUpdateShopMutation()
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (data?.data) {
      reset({
        name: data.data.name,
        phone: data.data.phone,
        address: data.data.address,
        currency: data.data.currency,
        timezone: data.data.timezone,
        requirePaymentBeforeDelivery: data.data.settings?.requirePaymentBeforeDelivery,
        receiptFooter: data.data.settings?.receiptFooter,
      })
    }
  }, [data, reset])

  if (isLoading) return <LoadingState variant="page" />

  const onSubmit = async (values) => {
    try {
      await updateShop({
        name: values.name,
        phone: values.phone,
        address: values.address,
        currency: values.currency,
        timezone: values.timezone,
        settings: {
          requirePaymentBeforeDelivery: Boolean(values.requirePaymentBeforeDelivery),
          receiptFooter: values.receiptFooter || '',
        },
      }).unwrap()
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Shop settings" />
      <form
        className="space-y-4 rounded-xl border border-line bg-panel p-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        {['name', 'phone', 'address', 'currency', 'timezone', 'receiptFooter'].map((f) => (
          <div key={f} className="space-y-1">
            <Label>{f}</Label>
            <Input {...register(f)} />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('requirePaymentBeforeDelivery')} />
          Require payment before delivery
        </label>
        <Button type="submit" loading={saving} loadingText="Saving…">Save settings</Button>
      </form>
    </div>
  )
}
