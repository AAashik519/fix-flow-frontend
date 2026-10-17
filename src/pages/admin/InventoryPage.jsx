import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  useCreateInventoryItemMutation,
  useGetInventoryQuery,
  useGetLowStockQuery,
} from '../../services/api/inventoryApi'
import { formatMoney } from '../../lib/utils'

const schema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  purchaseCost: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
})

export default function InventoryPage() {
  const { data, isLoading } = useGetInventoryQuery({ limit: 50 })
  const low = useGetLowStockQuery()
  const [createItem, { isLoading: saving }] = useCreateInventoryItemMutation()
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    try {
      await createItem(values).unwrap()
      toast.success('Item added')
      reset()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <PageHeader title="Inventory" description="Spare parts and stock levels" />
      {(low.data?.data || []).length ? (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Low stock: {(low.data?.data || []).map((i) => i.name).join(', ')}
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 grid gap-3 rounded-xl border border-line bg-panel p-4 md:grid-cols-3"
      >
        {['name', 'sku', 'category', 'purchaseCost', 'sellingPrice', 'quantity', 'lowStockThreshold'].map(
          (f) => (
            <div key={f} className="space-y-1">
              <Label>{f}</Label>
              <Input
                type={
                  ['purchaseCost', 'sellingPrice', 'quantity', 'lowStockThreshold'].includes(f)
                    ? 'number'
                    : 'text'
                }
                step="0.01"
                {...register(f)}
              />
            </div>
          ),
        )}
        <div className="md:col-span-3">
          <Button disabled={saving}>Add item</Button>
        </div>
      </form>
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-panel">
          <table className="min-w-full text-sm">
            <thead className="bg-surface text-left text-ink-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Sell</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((i) => (
                <tr key={i._id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link className="text-brand-700" to={`/inventory/${i._id}`}>
                      {i.sku}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{i.name}</td>
                  <td className="px-4 py-3">{i.quantity}</td>
                  <td className="px-4 py-3">{formatMoney(i.sellingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
