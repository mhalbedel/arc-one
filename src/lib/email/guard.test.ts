import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { claimOrderEmail } from './guard'

/**
 * Minimaler Supabase-Stub, der das bedingte Update
 * `update(...).eq('id').is('confirmation_email_sent_at', null).select().maybeSingle()`
 * gegen eine In-Memory-Zeile modelliert: Der Claim greift nur, solange die Spalte
 * noch leer ist.
 */
function makeSupabase(initial: string | null) {
  let sentAt = initial
  let pending: string | null = null
  const builder = {
    update(vals: { confirmation_email_sent_at: string }) {
      pending = vals.confirmation_email_sent_at
      return builder
    },
    eq() {
      return builder
    },
    is() {
      return builder
    },
    select() {
      return builder
    },
    async maybeSingle() {
      if (sentAt === null) {
        sentAt = pending
        return { data: { id: 'order-1' } }
      }
      return { data: null }
    },
  }
  return { from: () => builder } as never
}

describe('claimOrderEmail (genau einmal)', () => {
  it('gibt beim ersten Aufruf true zurueck', async () => {
    const supabase = makeSupabase(null)
    expect(await claimOrderEmail(supabase, 'order-1')).toBe(true)
  })

  it('gibt bei jedem weiteren Aufruf false zurueck', async () => {
    const supabase = makeSupabase(null)
    expect(await claimOrderEmail(supabase, 'order-1')).toBe(true)
    expect(await claimOrderEmail(supabase, 'order-1')).toBe(false)
    expect(await claimOrderEmail(supabase, 'order-1')).toBe(false)
  })

  it('gibt false zurueck, wenn die Mail bereits zuvor versendet wurde', async () => {
    const supabase = makeSupabase('2026-06-12T10:00:00Z')
    expect(await claimOrderEmail(supabase, 'order-1')).toBe(false)
  })
})
