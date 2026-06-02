import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArcGrid } from '@/components/arcs/arc-grid'
import { createClient } from '@/lib/supabase/server'
import type { ArcWithDrop, Drop } from '@/types'

const USP_PILLARS = [
  {
    title: 'Kein zweites auf der Welt',
    body: '~3.000 Rohlinge. Jeder einmal. Die Natur hat Form und Wölbung mitbestimmt — kein zweites Stück sieht aus wie Ihres.',
  },
  {
    title: 'Zwei Stunden Schliff. Pro Stück.',
    body: 'Eukalyptus ist hart wie Stein. Jede Oberfläche entsteht durch Handarbeit — das ist keine Ineffizienz, das ist die Voraussetzung für das Ergebnis.',
  },
  {
    title: 'Licht mit CRI 98',
    body: 'Der höchste Farbwiedergabeindex, den Innenraumbeleuchtung erreichen kann. Die Maserung des Holzes leuchtet auf wie unter freiem Himmel — oder besser.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredArcs } = await supabase
    .from('arcs')
    .select('*, drops(id, title, status)')
    .eq('is_featured', true)
    .limit(3)

  const typedFeatured = (featuredArcs ?? []) as ArcWithDrop[]

  // Featured-Drop-Teaser: zeigt den naechsten aktiven Drop (PROJ-6).
  // Existiert keiner — oder blockt RLS den Lesezugriff — bleibt der Teaser aus.
  const { data: activeDropData } = await supabase
    .from('drops')
    .select('id, title, slug, description, status')
    .in('status', ['SCHEDULED', 'LIVE'])
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const activeDrop = activeDropData as Pick<
    Drop,
    'id' | 'title' | 'slug' | 'description' | 'status'
  > | null

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

      {/* Brand Statement */}
      <Separator />
      <section className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight mb-8">
          Fürchterliches Licht gibt es genug.
        </h2>
        <div className="space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed">
          <p>
            Gleichmäßiges, neutrales, industrielles Licht, das Räume ausleuchtet und
            dabei nichts sagt. ARC-ONE baut das Gegenteil: Leuchten aus Eukalyptus —
            einem der härtesten, widerspenstigsten Hölzer der Welt — die nicht nur
            beleuchten, sondern den Charakter eines Raumes mitbestimmen.
          </p>
          <p>
            Jeder Arc entsteht aus einem einzigen Schnitt durch den vollen Stamm. Beim
            Trocknen entscheidet das Holz selbst, wie es sich verformt. Wir schleifen,
            veredeln, bestücken. Den Arc selbst hat die Natur bestimmt.
          </p>
        </div>
      </section>

      {/* USP — drei Saeulen */}
      <Separator />
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <h2 className="sr-only">Warum ARC-ONE</h2>
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {USP_PILLARS.map((pillar) => (
            <div key={pillar.title}>
              <h3 className="font-serif text-xl md:text-2xl font-normal leading-snug mb-4">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured-Drop-Teaser — nur bei aktivem Drop */}
      {activeDrop && (
        <>
          <Separator />
          <section className="mx-auto max-w-3xl px-6 py-24 md:py-32">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5">
              Aktueller Drop
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight mb-6">
              {activeDrop.title}
            </h2>
            {activeDrop.description && (
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mb-10">
                {activeDrop.description}
              </p>
            )}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-xs tracking-[0.15em] uppercase px-8"
            >
              {/* Ziel: Drop-/Warteliste-Seite (PROJ-6) — bis dahin Katalog */}
              <Link href="/arcs">Jetzt ansehen → (Warteliste aktiv)</Link>
            </Button>
          </section>
        </>
      )}

      {/* Manufaktur-Teaser */}
      <Separator />
      <section className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight mb-8">
          Vom Wald in die Werkstatt.
        </h2>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mb-10">
          An den Hängen oberhalb von Monchique wächst Eukalyptus unter enormer innerer
          Spannung. Wir fällen, trocknen, schleifen und fertigen vor Ort — dreißig
          Minuten vom Wald bis zur Werkstatt. Was dabei entsteht, bestimmt das Holz mit.
        </p>
        <Button
          asChild
          variant="ghost"
          className="text-xs tracking-[0.15em] uppercase px-0 hover:bg-transparent hover:text-muted-foreground"
        >
          {/* Ziel: Manufaktur-Seite (PROJ-11) — bis dahin Katalog, kein toter Link */}
          <Link href="/arcs">Die Geschichte dahinter →</Link>
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
