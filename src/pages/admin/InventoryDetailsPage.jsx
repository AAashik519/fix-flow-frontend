import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  useAddStockMovementMutation,
  useGetInventoryItemQuery,
  useGetStockMovementsQuery,
  useRemoveInventoryPhotoMutation,
  useUpdateInventoryItemMutation,
  useUploadInventoryPhotosMutation,
} from '../../services/api/inventoryApi'
import { formatDate, idempotencyKey } from '../../lib/utils'

const nonNegative = (label, integer = false) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z
      .number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` })
      .min(0, `${label} cannot be negative`)
      .refine((n) => !integer || Number.isInteger(n), `${label} must be a whole number`),
  )

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  purchaseCost: nonNegative('Purchase cost'),
  sellingPrice: nonNegative('Selling price'),
  lowStockThreshold: nonNegative('Low stock threshold', true),
})

const EDIT_FIELDS = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'purchaseCost', label: 'Purchase cost', type: 'number' },
  { name: 'sellingPrice', label: 'Selling price', type: 'number' },
  { name: 'lowStockThreshold', label: 'Low stock threshold', type: 'number' },
]

export default function InventoryDetailsPage() {
  const { id } = useParams()
  const { data, isLoading, refetch } = useGetInventoryItemQuery(id)
  const movements = useGetStockMovementsQuery(id)
  const [addMovement, { isLoading: purchasing }] = useAddStockMovementMutation()
  const [uploadPhotos, { isLoading: uploading }] = useUploadInventoryPhotosMutation()
  const [removePhoto] = useRemoveInventoryPhotoMutation()
  const [updateItem, { isLoading: updating }] = useUpdateInventoryItemMutation()
  const [qty, setQty] = useState('')
  const [newPhotos, setNewPhotos] = useState([])
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
  })

  useEffect(() => {
    if (!data?.data) return
    const item = data.data
    reset({
      name: item.name || '',
      category: item.category || '',
      purchaseCost: item.purchaseCost ?? 0,
      sellingPrice: item.sellingPrice ?? 0,
      lowStockThreshold: item.lowStockThreshold ?? 0,
    })
  }, [data, reset])

  if (isLoading) return <LoadingState />
  const item = data?.data

  const onSave = async (values) => {
    try {
      await updateItem({ id, ...values }).unwrap()
      toast.success('Item updated')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const purchase = async () => {
    const amount = Number(qty)
    if (!qty || !Number.isInteger(amount) || amount < 1) {
      toast.error('Enter a quantity of 1 or more')
      return
    }
    try {
      await addMovement({
        id,
        type: 'PURCHASE',
        quantityChange: Number(qty),
        idempotencyKey: idempotencyKey('stk'),
      }).unwrap()
      toast.success('Stock updated')
      refetch()
      movements.refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const savePhotos = async () => {
    if (!newPhotos.length) return
    try {
      await uploadPhotos({ id, files: newPhotos }).unwrap()
      toast.success('Photos uploaded')
      setNewPhotos([])
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Upload failed')
    }
  }

  const onRemoveExisting = async (url) => {
    try {
      await removePhoto({ id, url }).unwrap()
      toast.success('Photo removed')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <PageHeader title={item?.name} description={item?.sku} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <form onSubmit={handleSubmit(onSave)} className="grid gap-3 sm:grid-cols-2">
              {EDIT_FIELDS.map((f) => {
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
                    {errors[f.name] ? <p className="text-xs text-red-600">{errors[f.name].message}</p> : null}
                  </div>
                )
              })}
              <div className="sm:col-span-2">
                <Button type="submit" loading={updating} loadingText="Saving…">Save changes</Button>
              </div>
            </form>
            <div>Quantity: {item?.quantity}</div>
            <div className="flex gap-2 pt-2">
              <Input
                type="number"
                min={1}
                step={1}
                value={qty}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault()
                }}
                onChange={(e) => setQty(e.target.value.replace(/-/g, ''))}
              />
              <Button type="button" loading={purchasing} loadingText="Saving…" onClick={purchase}>Record purchase (+)</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock movements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(movements.data?.data || []).map((m) => (
              <div key={m._id} className="flex justify-between border-b border-line py-2">
                <span>
                  {m.type} {m.quantityChange}
                </span>
                <span className="text-ink-500">{formatDate(m.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MultiPhotoPicker
              files={newPhotos}
              onFilesChange={setNewPhotos}
              existingUrls={item?.photoUrls || []}
              onRemoveExisting={onRemoveExisting}
              label="Item photos"
            />
            {newPhotos.length ? (
              <Button type="button" loading={uploading} loadingText="Uploading…" onClick={savePhotos}>
                Upload photos
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
