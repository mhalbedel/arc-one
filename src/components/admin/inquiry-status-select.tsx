'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateInquiryStatus } from '@/app/admin/(dashboard)/anfragen/actions'
import type { InquiryStatus } from '@/types'

const STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: 'NEU', label: 'Neu' },
  { value: 'KONTAKTIERT', label: 'Kontaktiert' },
  { value: 'ABGESCHLOSSEN', label: 'Abgeschlossen' },
]

export function InquiryStatusSelect({ id, status }: { id: string; status: InquiryStatus }) {
  const [value, setValue] = useState<InquiryStatus>(status)
  const [saving, setSaving] = useState(false)

  async function onChange(next: string) {
    const prev = value
    setValue(next as InquiryStatus)
    setSaving(true)
    const res = await updateInquiryStatus(id, next as InquiryStatus)
    setSaving(false)
    if (res.error) {
      setValue(prev)
      toast.error(res.error)
    } else {
      toast.success('Status aktualisiert.')
    }
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={saving}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
