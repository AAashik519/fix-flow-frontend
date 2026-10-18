import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { MultiPhotoPicker } from '../../components/common/MultiPhotoPicker'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  useGetDevicesQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useUploadDevicePhotosMutation,
  useRemoveDevicePhotoMutation,
} from '../../services/api/devicesApi'
import { useGetCustomersQuery } from '../../services/api/customersApi'
import { assetUrl } from '../../lib/utils'

const EMPTY_DEVICE = {
  customerId: '',
  category: 'MOBILE',
  brand: '',
  model: '',
  serialOrImei: '',
  intakeCondition: '',
  reportedProblem: '',
}

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
  const formRef = useRef(null)
  const [search, setSearch] = useState('')
  const [photos, setPhotos] = useState([])
  const [editingId, setEditingId] = useState(null)
  const { data, isLoading } = useGetDevicesQuery({ search: search || undefined })
  const customers = useGetCustomersQuery({ limit: 100 })
  const [createDevice, { isLoading: creating }] = useCreateDeviceMutation()
  const [updateDevice, { isLoading: updating }] = useUpdateDeviceMutation()
  const [uploadPhotos, { isLoading: uploading }] = useUploadDevicePhotosMutation()
  const [removePhoto] = useRemoveDevicePhotoMutation()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_DEVICE,
  })
  const saving = creating || updating || uploading
  const editingDevice = (data?.data || []).find((d) => d._id === editingId)

  const clearForm = () => {
    setEditingId(null)
    setPhotos([])
    reset(EMPTY_DEVICE)
  }

  const onSubmit = async (values) => {
    try {
      if (editingId) {
        await updateDevice({ id: editingId, ...values }).unwrap()
        if (photos.length) {
          await uploadPhotos({ id: editingId, files: photos }).unwrap()
        }
        toast.success('Device updated')
      } else {
        const res = await createDevice(values).unwrap()
        if (photos.length) {
          await uploadPhotos({ id: res.data._id, files: photos }).unwrap()
        }
        toast.success('Device registered')
      }
      clearForm()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  const startEdit = (device) => {
    setEditingId(device._id)
    setPhotos([])
    reset({
      customerId: device.customerId?._id || '',
      category: device.category || 'MOBILE',
      brand: device.brand || '',
      model: device.model || '',
      serialOrImei: device.serialOrImei || '',
      intakeCondition: device.intakeCondition || '',
      reportedProblem: device.reportedProblem || '',
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const removeExistingPhoto = async (url) => {
    if (!editingId) return
    try {
      await removePhoto({ id: editingId, url }).unwrap()
      toast.success('Photo removed')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed')
    }
  }

  return (
    <div>
      <PageHeader title="Devices" description="Devices received for repair" />
      <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="mb-6 grid gap-3 rounded-xl border border-line bg-panel p-4 md:grid-cols-3">
        {editingId ? <p className="text-sm font-medium text-ink-700 md:col-span-3">Editing device</p> : null}
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
        <MultiPhotoPicker
          files={photos}
          onFilesChange={setPhotos}
          existingUrls={editingDevice?.photoUrls || []}
          onRemoveExisting={editingId && !saving ? removeExistingPhoto : undefined}
          disabled={saving}
          label="Device photos"
        />
        <div className="flex items-center gap-2 md:col-span-3">
          <Button type="submit" loading={saving} loadingText={uploading || photos.length ? 'Uploading…' : 'Saving…'}>
            {editingId ? 'Save changes' : 'Register device'}
          </Button>
          {saving ? <span className="text-sm text-ink-500">Please wait, do not click again.</span> : null}
          {editingId ? (
            <Button type="button" variant="outline" disabled={saving} onClick={clearForm}>Cancel</Button>
          ) : null}
        </div>
      </form>
      <Input className="mb-4" placeholder="Search devices..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {isLoading ? <LoadingState variant="list" /> : null}
      {!isLoading && !(data?.data || []).length ? <EmptyState title="No devices" /> : null}
      <div className="space-y-2">
        {(data?.data || []).map((d) => (
          <div key={d._id} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                {(d.photoUrls || []).length ? (
                  <div className="flex shrink-0 gap-1">
                    {(d.photoUrls || []).slice(0, 3).map((url) => (
                      <div key={url} className="relative">
                        <img
                          src={assetUrl(url)}
                          alt=""
                          className="h-14 w-14 rounded-lg border border-line object-cover"
                        />
                        <button
                          type="button"
                          className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-[10px] text-white"
                          onClick={async () => {
                            try {
                              await removePhoto({ id: d._id, url }).unwrap()
                              toast.success('Photo removed')
                            } catch (err) {
                              toast.error(err?.data?.message || 'Failed')
                            }
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div>
                  <div className="font-medium">{d.brand} {d.model} · {d.category}</div>
                  <div className="text-ink-500">{d.customerId?.name || 'Customer'} · {d.serialOrImei || 'No serial'}</div>
                  {(d.photoUrls || []).length ? (
                    <div className="mt-1 text-xs text-ink-500">{d.photoUrls.length} photo{d.photoUrls.length === 1 ? '' : 's'}</div>
                  ) : null}
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => startEdit(d)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
