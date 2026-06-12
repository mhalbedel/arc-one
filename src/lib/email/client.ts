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
 * Faengt jeden Fehler ab und loggt ihn; wirft nie. Ein fehlgeschlagener Versand
 * darf einen abgeschlossenen Zahlungs-/Bestellvorgang niemals gefaehrden
 * (PROJ-7). Gibt `true` zurueck, wenn Resend die Mail angenommen hat.
 */
export async function sendEmail({
  to,
  subject,
  react,
  replyTo = EMAIL_REPLY_TO,
}: SendEmailParams): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      react,
      replyTo,
    })
    if (error) {
      console.error(`[email] Versand an ${to} fehlgeschlagen: ${error.message}`)
      return false
    }
    return true
  } catch (err) {
    console.error(`[email] Versand an ${to} fehlgeschlagen:`, err)
    return false
  }
}
