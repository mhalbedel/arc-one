import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArcStatusBadge } from '@/components/admin/arc-status-badge'
import { formatPrice } from '@/lib/utils'
import type { Arc } from '@/types'

export default async function ArcsListPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('arcs')
    .select('*')
    .order('serial_number', { ascending: true })
  const arcs = (data ?? []) as Arc[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Arcs</h1>
        <Button asChild>
          <Link href="/admin/arcs/neu">
            <Plus />
            Neuer Arc
          </Link>
        </Button>
      </div>

      {arcs.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Noch keine Arcs erfasst.
          </p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/admin/arcs/neu">Ersten Arc anlegen</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Seriennummer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Basispreis</TableHead>
                <TableHead className="text-right">Maße (cm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arcs.map((arc) => (
                <TableRow key={arc.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/admin/arcs/${arc.id}`} className="block">
                      {arc.photo_front_url ? (
                        <Image
                          src={arc.photo_front_url}
                          alt={arc.serial_number}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/admin/arcs/${arc.id}`} className="hover:underline">
                      {arc.serial_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ArcStatusBadge status={arc.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(arc.base_price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {arc.width_cm}×{arc.height_cm}×{arc.depth_cm}
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
