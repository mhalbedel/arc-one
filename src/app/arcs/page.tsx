import { createClient } from '@/lib/supabase/server'
import { ArcGrid } from '@/components/arcs/arc-grid'
import { SortControl } from '@/components/arcs/sort-control'
import Link from 'next/link'
import type { ArcWithDrop } from '@/types'

type ArcsPageProps = {
  searchParams: Promise<{ sort?: string }>
}

export default async function ArcsPage({ searchParams }: ArcsPageProps) {
  const { sort } = await searchParams
  const sortValue = sort === 'price_desc' ? 'price_desc' : 'price_asc'

  const supabase = await createClient()

  const { data: arcs } = await supabase
    .from('arcs')
    .select('*, drops(id, title, status)')
    .order('base_price', { ascending: sortValue === 'price_asc' })
    .order('serial_number', { ascending: true })

  const typedArcs = (arcs ?? []) as ArcWithDrop[]

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-baseline justify-between mb-14">
        <h1 className="font-serif text-4xl md:text-5xl font-normal">Alle Arcs</h1>
        <SortControl currentSort={sortValue} />
      </div>

      {typedArcs.length === 0 ? (
        <div className="py-32 text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Aktuell sind keine Arcs verfügbar.
          </p>
          <Link
            href="/warteliste"
            className="text-xs tracking-[0.15em] uppercase underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Warteliste beitreten →
          </Link>
        </div>
      ) : (
        <ArcGrid arcs={typedArcs} />
      )}
    </main>
  )
}
