import { ShopCard } from './shop-card'
import type { ShopItem } from '@/types'

type ShopGridProps = {
  items: ShopItem[]
}

export function ShopGrid({ items }: ShopGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
      {items.map((item) => (
        <ShopCard key={`${item.source}-${item.code}`} item={item} />
      ))}
    </div>
  )
}
