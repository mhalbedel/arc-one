'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ORDER_STATUS_LABELS } from '@/components/admin/order-status-badge'
import { updateOrderStatus, saveAdminNotes } from '@/app/admin/(dashboard)/bestellungen/actions'
import type { OrderStatus } from '@/types'

const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

export function OrderEditor({
  orderId,
  initialStatus,
  initialNotes,
}: {
  orderId: string
  initialStatus: OrderStatus
  initialNotes: string | null
}) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [pending, startTransition] = useTransition()
  const [savingNotes, setSavingNotes] = useState(false)

  function handleStatusChange(next: string) {
    const nextStatus = next as OrderStatus
    const prev = status
    setStatus(nextStatus)
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, nextStatus)
      if (res.error) {
        setStatus(prev)
        toast.error(res.error)
        return
      }
      toast.success('Status aktualisiert.')
      router.refresh()
    })
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    const res = await saveAdminNotes(orderId, notes)
    setSavingNotes(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Notiz gespeichert.')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="order-status">Bestellstatus</Label>
        <Select value={status} onValueChange={handleStatusChange} disabled={pending}>
          <SelectTrigger id="order-status" className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="order-notes">Admin-Notiz</Label>
        <Textarea
          id="order-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Interne Notiz zu dieser Bestellung …"
        />
        <Button onClick={handleSaveNotes} disabled={savingNotes} size="sm">
          {savingNotes ? 'Wird gespeichert …' : 'Notiz speichern'}
        </Button>
      </div>
    </div>
  )
}
