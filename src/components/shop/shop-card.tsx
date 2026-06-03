import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { PRODUCT_CATEGORY_LABELS, type ShopItem } from '@/types'

type ShopCardProps = {
  item: ShopItem
}

export function ShopCard({ item }: ShopCardProps) {
  const isPremium = item.tier === 'premium_art'

  return (
    <Link href={`/shop/${item.code}`} className="group block">
      <article>
        <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground tracking-widest uppercase">
                Kein Foto
              </span>
            </div>
          )}
          {isPremium && (
            <div className="absolute top-3 left-3">
              <Badge className="text-[10px] tracking-[0.12em] uppercase">Premium / Art</Badge>
            </div>
          )}
          {item.isSold && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-[10px] tracking-[0.12em] uppercase">
                Verkauft
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-serif text-sm">{item.name}</span>
            <span className="text-sm font-medium tabular-nums">
              {item.purchaseMode === 'inquiry' || item.priceCents == null
                ? 'Preis auf Anfrage'
                : formatPrice(item.priceCents)}
            </span>
          </div>
          <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground">
            {PRODUCT_CATEGORY_LABELS[item.category]}
          </p>
        </div>
      </article>
    </Link>
  )
}
