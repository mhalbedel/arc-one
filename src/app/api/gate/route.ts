import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { GATE_COOKIE } from '@/lib/gate'

const bodySchema = z.object({ pin: z.string().regex(/^\d{6}$/) })

/** PROJ-15: schaltet das Coming-Soon-Tor nach korrekter 6-stelliger PIN frei. */
export async function POST(req: NextRequest) {
  if (!rateLimit(`gate:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Zu viele Versuche. Bitte spaeter erneut.' },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungueltige Eingabe.' }, { status: 400 })
  }

  if (parsed.data.pin !== process.env.ARC_GATE_PIN) {
    return NextResponse.json({ error: 'Falscher Code.' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(GATE_COOKIE, process.env.ARC_GATE_TOKEN!, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
