import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArcGrid } from '@/components/arcs/arc-grid'
import { createClient } from '@/lib/supabase/server'
import type { ArcWithDrop } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredArcs } = await supabase
    .from('arcs')
    .select('*, drops(id, title, status)')
    .eq('is_featured', true)
    .limit(3)

  const typedFeatured = (featuredArcs ?? []) as ArcWithDrop[]

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-28 md:pt-20 md:pb-40">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
          Monchique · Algarve · Portugal
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal leading-[1.05] mb-10">
          <span className="block">Every</span>
          <span className="block pl-16 md:pl-24 lg:pl-32">Arc - One</span>
          <span className="block pl-[14rem] md:pl-[21rem] lg:pl-[28rem]">of a kind.</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-lg mb-14 leading-relaxed">
          Handgefertigte Eukalyptus-Leuchten aus den Wäldern bei Monchique —
          entstanden durch das Zusammenspiel von Natur, Zeit und Handwerk.
        </p>
        <Button asChild size="lg" className="text-xs tracking-[0.15em] uppercase px-8">
          <Link href="/arcs">Alle Arcs entdecken</Link>
        </Button>
      </section>

      {/* Highlight Arcs — only rendered when admin has selected featured arcs */}
      {typedFeatured.length > 0 && (
        <>
          <Separator />
          <section className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex items-baseline justify-between mb-14">
              <h2 className="font-serif text-2xl md:text-3xl font-normal">
                Ausgewählte Arcs
              </h2>
              <Link
                href="/arcs"
                className="text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Alle ansehen →
              </Link>
            </div>
            <ArcGrid arcs={typedFeatured} />
          </section>
        </>
      )}
    </main>
  )
}
