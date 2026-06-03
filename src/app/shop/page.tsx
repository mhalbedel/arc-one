import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CategoryFilter } from '@/components/shop/category-filter'
import { ShopGrid } from '@/components/shop/shop-grid'
import { productToShopItem, fixedArcToShopItem } from '@/lib/shop'
import { PRODUCT_CATEGORIES, type Arc, type Product, type ProductCategory, type ShopItem } from '@/types'

type ShopPageProps = {
  searchParams: Promise<{ kategorie?: string }>
}

function parseCategory(value: string | undefined): ProductCategory | null {
  const match = PRODUCT_CATEGORIES.find((c) => c.value === value)
  return match ? match.value : null
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { kategorie } = await searchParams
  const category = parseCategory(kategorie)

  const supabase = await createClient()

  // Zwei Quellen — Nicht-Arc-Produkte + fertige (FIXED) Arcs. Verkaufte bleiben
  // sichtbar (als „Verkauft"), ausgeblendete/archivierte nicht.
  const [{ data: products }, { data: fixedArcs }] = await Promise.all([
    supabase.from('products').select('*').eq('is_published', true).neq('status', 'ARCHIVED'),
    supabase.from('arcs').select('*').eq('status', 'FIXED'),
  ])

  const items: ShopItem[] = [
    ...((products ?? []) as Product[]).map(productToShopItem),
    ...((fixedArcs ?? []) as Arc[]).map(fixedArcToShopItem),
  ]
    .filter((item) => (category ? item.category === category : true))
    // Premium/Art zuerst, verkaufte Stücke nach hinten
    .sort((a, b) => {
      if (a.isSold !== b.isSold) return a.isSold ? 1 : -1
      if (a.tier !== b.tier) return a.tier === 'premium_art' ? -1 : 1
      return a.name.localeCompare(b.name, 'de')
    })

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-14 space-y-8">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-normal">Shop</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-xl leading-relaxed">
            Fertige Stücke aus der Manufaktur — Leuchten, Schalen, Tische und Einzelstücke.
            Jedes Objekt ein Unikat.
          </p>
        </div>
        <CategoryFilter current={category} />
      </div>

      {items.length === 0 ? (
        <div className="py-32 text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Aktuell sind keine Stücke im Shop verfügbar.
          </p>
          <Link
            href="/arcs"
            className="text-xs tracking-[0.15em] uppercase underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Arcs entdecken →
          </Link>
        </div>
      ) : (
        <ShopGrid items={items} />
      )}
    </main>
  )
}
