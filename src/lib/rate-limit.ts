/**
 * Leichtgewichtiges In-Memory-Rate-Limit (pro Instanz, ohne externen Service).
 * Reicht als Spam-Schutz für öffentliche Formular-Endpunkte (z. B. Anfragen).
 * Auf Serverless skaliert es pro Instanz — bewusst einfach gehalten (kein Redis).
 */
const hits = new Map<string, number[]>()

/**
 * Gibt true zurück, wenn die Anfrage erlaubt ist, false bei Überschreitung.
 * @param key      Eindeutiger Schlüssel (z. B. IP + Endpunkt)
 * @param limit    Max. Anfragen im Fenster
 * @param windowMs Fenstergröße in Millisekunden
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

/** Client-IP aus den Standard-Proxy-Headern (Vercel setzt x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return fwd?.split(',')[0]?.trim() || 'unknown'
}
