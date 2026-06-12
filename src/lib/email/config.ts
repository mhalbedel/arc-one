/**
 * Feste Absender-/Empfaengeradressen fuer alle ARC-ONE Transaktionsmails.
 * Adressen sind fix (verifizierte Domain arc-one.de) — nur der API-Key ist
 * konfigurierbar (RESEND_API_KEY). Siehe PROJ-7 Decision Log.
 */
export const EMAIL_FROM = 'ARC ONE <bestellung@arc-one.de>'
export const EMAIL_REPLY_TO = 'kontakt@arc-one.de'
export const ATELIER_INBOX = 'kontakt@arc-one.de'
