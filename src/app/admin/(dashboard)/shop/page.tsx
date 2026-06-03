import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/utils'
import { PRODUCT_CATEGORY_LABELS, type Product } from '@/types'

export default async function AdminShopListPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  const products = (data ?? []) as Product[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shop-Produkte</h1>
        <Button asChild>
          <Link href="/admin/shop/neu">Neues Produkt</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">Noch keine Produkte angelegt.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Fertige Arcs werden über das Arc-Formular (Status FIXED) in den Shop gestellt.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Modus</TableHead>
                <TableHead className="text-right">Preis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sichtbar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/shop/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">{p.product_code}</span>
                  </TableCell>
                  <TableCell>{PRODUCT_CATEGORY_LABELS[p.category]}</TableCell>
                  <TableCell>
                    {p.tier === 'premium_art' ? (
                      <Badge className="text-[10px] tracking-[0.1em] uppercase">Premium / Art</Badge>
                    ) : (
                      <span className="text-muted-foreground">Standard</span>
                    )}
                  </TableCell>
                  <TableCell>{p.purchase_mode === 'inquiry' ? 'Anfrage' : 'Direktkauf'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.price_cents == null ? '—' : formatPrice(p.price_cents)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'AVAILABLE' ? 'outline' : 'secondary'} className="text-[10px] uppercase tracking-[0.1em]">
                      {p.status === 'AVAILABLE' ? 'Verfügbar' : p.status === 'SOLD' ? 'Verkauft' : 'Archiviert'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.is_published ? 'Veröffentlicht' : 'Ausgeblendet'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
