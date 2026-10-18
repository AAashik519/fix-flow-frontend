import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { MultiPhotoPicker } from '../../components/common/MultiPhotoPicker'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  useCreateInventoryItemMutation,
  useGetInventoryQuery,
  useGetLowStockQuery,
  useUploadInventoryPhotosMutation,
} from '../../services/api/inventoryApi'
import { assetUrl, formatMoney } from '../../lib/utils'

const nonNegative = (label, integer = false) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z
      .number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` })
      .min(0, `${label} cannot be negative`)
      .refine((n) => !integer || Number.isInteger(n), `${label} must be a whole number`),
  )

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  purchaseCost: nonNegative('Purchase cost'),
  sellingPrice: nonNegative('Selling price'),
  quantity: nonNegative('Quantity', true),
  lowStockThreshold: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().int().min(0, 'Low stock threshold cannot be negative').optional(),
  ),
})

const FIELDS = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'sku', label: 'SKU (Stock Keeping Unit)', type: 'text' },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'purchaseCost', label: 'Purchase cost', type: 'number' },
  { name: 'sellingPrice', label: 'Selling price', type: 'number' },
  { name: 'quantity', label: 'Quantity', type: 'number' },
  { name: 'lowStockThreshold', label: 'Low stock threshold', type: 'number' },
]

export default function InventoryPage() {
  const [photos, setPhotos] = useState([])
  const { data, isLoading } = useGetInventoryQuery({ limit: 50 })
  const low = useGetLowStockQuery()
  const [createItem, { isLoading: saving }] = useCreateInventoryItemMutation()
  const [uploadPhotos] = useUploadInventoryPhotosMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      purchaseCost: '',
      sellingPrice: '',
      quantity: '',
      lowStockThreshold: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      const res = await createItem(values).unwrap()
      if (photos.length) {
        await uploadPhotos({ id: res.data._id, files: photos }).unwrap()
      }
      toast.success('Item added')
      reset()
      setPhotos([])
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed')
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
        className="mb-6 grid gap-3 rounded-xl border border-line bg-panel p-4 md:grid-cols-3 capitalize"
      >
        {FIELDS.map((f) => {
          const field = register(f.name)
          return (
            <div key={f.name} className="space-y-1">
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input
                id={f.name}
                type={f.type}
                step={f.type === 'number' ? '1' : undefined}
                min={f.type === 'number' ? 0 : undefined}
                {...field}
                onKeyDown={
                  f.type === 'number'
                    ? (e) => {
                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault()
                      }
                    : undefined
                }
                onChange={(e) => {
                  if (f.type === 'number') e.target.value = e.target.value.replace(/-/g, '')
                  field.onChange(e)
                }}
              />
              {errors[f.name] ? (
                <p className="text-xs text-red-600">{errors[f.name].message}</p>
              ) : null}
            </div>
          )
        })}
        <MultiPhotoPicker files={photos} onFilesChange={setPhotos} label="Item photos" size="sm" />
        <div className="md:col-span-3">
          <Button type="submit" loading={saving} loadingText="Saving…">
            Add item
          </Button>
        </div>
      </form>
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-panel">
          <table className="min-w-full text-sm">
            <thead className="bg-surface text-left text-ink-500">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Sell</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((i) => (
                <tr key={i._id} className="border-t border-line">
                  <td className="px-4 py-3">
                    {(i.photoUrls || [])[0] ? (
                      <img
                        src={assetUrl(i.photoUrls[0])}
                        alt=""
                        className="h-10 w-10 rounded-lg border border-line object-cover"
                      />
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link className="text-brand-700" to={`/inventory/${i._id}`}>
                      {i.sku}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{i.name}</td>
                  <td className="px-4 py-3">{i.quantity}</td>
                  <td className="px-4 py-3">{formatMoney(i.sellingPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/inventory/${i._id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
