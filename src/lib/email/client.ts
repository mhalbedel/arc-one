import 'server-only'
import type { ReactElement } from 'react'
import { Resend } from 'resend'
import { EMAIL_FROM, EMAIL_REPLY_TO } from './config'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

/**
 * Hartes Zeitlimit pro Versand. Resend/undici setzen kein Default-Timeout; ohne
 * dieses Limit wuerde ein haengender Aufruf die Bestaetigungsseite bzw. die
 * Anfrage-Response blockieren (PROJ-7 R1 "Timeout → Seite wird normal angezeigt").
 */
const SEND_TIMEOUT_MS = 5000

export interface SendEmailParams {
  to: string
  subject: string
  react: ReactElement
  /** Standard ist die Atelier-Adresse; fuer interne Mails meist nicht gesetzt. */
  replyTo?: string
}

/**
 * Versendet eine Transaktionsmail — **Best-Effort und nicht-blockierend**.
 *
 * Faengt jeden Fehler ab, loggt ihn und bricht nach `SEND_TIMEOUT_MS` ab; wirft
 * nie und blockiert nie laenger als das Zeitlimit. Ein fehlgeschlagener oder
 * haengender Versand darf einen abgeschlossenen Zahlungs-/Bestellvorgang niemals
 * gefaehrden. Gibt `true` zurueck, wenn Resend die Mail angenommen hat.
 */
export async function sendEmail({
  to,
  subject,
  react,
  replyTo = EMAIL_REPLY_TO,
}: SendEmailParams): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), SEND_TIMEOUT_MS)
  })
  const send = getResend()
    .emails.send({ from: EMAIL_FROM, to, subject, react, replyTo })
    .then((res) => ({ error: res.error as { message: string } | null }))
    .catch((err: unknown) => ({ error: { message: String(err) } }))

  try {
    const outcome = await Promise.race([send, timeout])
    if (outcome === 'timeout') {
      console.error(`[email] Versand an ${to} nach ${SEND_TIMEOUT_MS}ms abgebrochen (Timeout)`)
      return false
    }
    if (outcome.error) {
      console.error(`[email] Versand an ${to} fehlgeschlagen: ${outcome.error.message}`)
      return false
    }
    return true
  } finally {
    if (timer) clearTimeout(timer)
  }
}
