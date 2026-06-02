import Link from 'next/link'
import { Package, ShoppingCart, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const OPEN_ORDER_STATUSES = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'DEPOSIT_PAID',
  'IN_PRODUCTION',
  'READY_TO_SHIP',
  'REMAINING_PAID',
  'SHIPPED',
]

async function getCounts() {
  const supabase = await createClient()
  const [ready, reserved, openOrders] = await Promise.all([
    supabase.from('arcs').select('*', { count: 'exact', head: true }).eq('status', 'READY'),
    supabase.from('arcs').select('*', { count: 'exact', head: true }).eq('status', 'RESERVED'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', OPEN_ORDER_STATUSES),
  ])
  return {
    ready: ready.count ?? 0,
    reserved: reserved.count ?? 0,
    openOrders: openOrders.count ?? 0,
  }
}

const TILES = [
  { href: '/admin/arcs', label: 'Arcs verwalten', icon: Package, desc: 'Unikate erfassen, bearbeiten, archivieren' },
  { href: '/admin/bestellungen', label: 'Bestellungen', icon: ShoppingCart, desc: 'Pre-Orders durch den Prozess fuehren' },
  { href: '/admin/preismatrix', label: 'Preismatrix', icon: Tag, desc: 'Aufpreise und Klassen-Grenzwerte pflegen' },
]

export default async function AdminDashboardPage() {
  const counts = await getCounts()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              READY-Arcs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{counts.ready}</p>
            <p className="text-xs text-muted-foreground">im Katalog sichtbar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reservierte Arcs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{counts.reserved}</p>
            <p className="text-xs text-muted-foreground">aktive Reservierungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Bestellungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{counts.openOrders}</p>
            <p className="text-xs text-muted-foreground">noch nicht abgeschlossen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href}>
            <Card className="h-full transition-colors hover:bg-accent/5">
              <CardContent className="flex flex-col gap-2 p-6">
                <tile.icon className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">{tile.label}</p>
                <p className="text-sm text-muted-foreground">{tile.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
