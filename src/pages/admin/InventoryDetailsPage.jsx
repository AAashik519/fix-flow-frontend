import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { LoadingState } from '../../components/common/LoadingState'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  useAddStockMovementMutation,
  useGetInventoryItemQuery,
  useGetStockMovementsQuery,
} from '../../services/api/inventoryApi'
import { formatDate, formatMoney, idempotencyKey } from '../../lib/utils'

export default function InventoryDetailsPage() {
  const { id } = useParams()
  const { data, isLoading, refetch } = useGetInventoryItemQuery(id)
  const movements = useGetStockMovementsQuery(id)
  const [addMovement] = useAddStockMovementMutation()
  const [qty, setQty] = useState(1)

  if (isLoading) return <LoadingState />
  const item = data?.data

  const purchase = async () => {
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

  return (
    <div>
      <PageHeader title={item?.name} description={item?.sku} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Quantity: {item?.quantity}</div>
            <div>Purchase: {formatMoney(item?.purchaseCost)}</div>
            <div>Selling: {formatMoney(item?.sellingPrice)}</div>
            <div>Low stock threshold: {item?.lowStockThreshold}</div>
            <div className="flex gap-2 pt-2">
              <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
              <Button onClick={purchase}>Record purchase (+)</Button>
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
      </div>
    </div>
  )
}
