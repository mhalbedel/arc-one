import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InquiryStatusSelect } from '@/components/admin/inquiry-status-select'
import type { InquiryStatus } from '@/types'

interface InquiryRow {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: InquiryStatus
  created_at: string
  products: { name: string; product_code: string } | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function AdminInquiriesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('product_inquiries')
    .select('id, name, email, phone, message, status, created_at, products(name, product_code)')
    .order('created_at', { ascending: false })
  const inquiries = (data ?? []) as unknown as InquiryRow[]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Anfragen</h1>

      {inquiries.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">Noch keine Anfragen eingegangen.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Anfragen zu Premium-/Art-Produkten erscheinen hier.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Nachricht</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inq) => (
                <TableRow key={inq.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(inq.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">{inq.products?.name ?? '—'}</TableCell>
                  <TableCell className="font-medium">{inq.name}</TableCell>
                  <TableCell className="text-sm">
                    <div>{inq.email}</div>
                    {inq.phone && <div className="text-muted-foreground">{inq.phone}</div>}
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">
                    <span className="line-clamp-3 whitespace-pre-line">{inq.message}</span>
                  </TableCell>
                  <TableCell>
                    <InquiryStatusSelect id={inq.id} status={inq.status} />
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
