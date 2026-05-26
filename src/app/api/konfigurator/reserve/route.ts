import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ArcStatus } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { arcId, sessionId, config } = body

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!arcId || !sessionId || !uuidRe.test(arcId) || !uuidRe.test(sessionId)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const reservedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // Atomic update: only succeeds if arc is still READY (not yet reserved)
  const updatePayload: { status: ArcStatus; reserved_until: string; reserved_by: string } = {
    status: 'RESERVED',
    reserved_until: reservedUntil,
    reserved_by: String(sessionId),
  }

  const { data, error } = await supabase
    .from('arcs')
    .update(updatePayload as unknown as never)
    .eq('id', arcId)
    .eq('status', 'READY')
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Dieser Arc wurde gerade von jemand anderem reserviert.' },
      { status: 409 }
    )
  }

  return NextResponse.json({ success: true, config })
}
