import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/types'

interface OrderListRow {
  id: string
  order_number: string
  total_price: number
  status: OrderStatus
  deposit_paid_at: string | null
  remaining_paid_at: string | null
  created_at: string
  customers: { name: string | null } | null
  arcs: { serial_number: string }[] | null
}

function paymentLabel(row: OrderListRow): string {
  if (row.remaining_paid_at) return 'Vollständig'
  if (row.deposit_paid_at) return 'Anzahlung'
  return 'Offen'
}

export default async function OrdersListPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(
      'id, order_number, total_price, status, deposit_paid_at, remaining_paid_at, created_at, customers(name), arcs(serial_number)',
    )
    .order('created_at', { ascending: false })
  const orders = (data ?? []) as unknown as OrderListRow[]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Bestellungen</h1>

      {orders.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">Noch keine Bestellungen eingegangen.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sobald ein Kunde eine Pre-Order abschliesst, erscheint sie hier.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bestellnr.</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Arc</TableHead>
                <TableHead className="text-right">Gesamt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zahlung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/bestellungen/${order.id}`} className="hover:underline">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customers?.name ?? '—'}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {order.arcs?.[0]?.serial_number ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(order.total_price)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {paymentLabel(order)}
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
