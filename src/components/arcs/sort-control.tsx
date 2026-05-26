'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SortValue = 'price_asc' | 'price_desc'

type SortControlProps = {
  currentSort: SortValue
}

export function SortControl({ currentSort }: SortControlProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(value: string) {
    const params = new URLSearchParams()
    if (value !== 'price_asc') params.set('sort', value)
    const search = params.toString()
    router.push(`${pathname}${search ? `?${search}` : ''}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-52 text-xs tracking-wide">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="price_asc" className="text-xs">
          Preis aufsteigend
        </SelectItem>
        <SelectItem value="price_desc" className="text-xs">
          Preis absteigend
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
