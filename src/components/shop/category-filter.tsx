import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/types'

type CategoryFilterProps = {
  current: ProductCategory | null
}

const TABS: { value: ProductCategory | null; label: string }[] = [
  { value: null, label: 'Alle' },
  ...PRODUCT_CATEGORIES,
]

export function CategoryFilter({ current }: CategoryFilterProps) {
  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-2">
      {TABS.map((tab) => {
        const active = current === tab.value
        const href = tab.value ? `/shop?kategorie=${tab.value}` : '/shop'
        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              'text-xs tracking-[0.15em] uppercase transition-colors',
              active ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
