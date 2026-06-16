/**
 * Coming-Soon-Tor (PROJ-15). Edge-sicher (keine Node-Imports) — wird sowohl vom
 * Proxy (src/proxy.ts) als auch von der Unlock-API (src/app/api/gate) genutzt.
 *
 * Das Tor ist nur auf Vercel aktiv; lokal (process.env.VERCEL nicht gesetzt) bleibt
 * die Seite voll offen. Oeffentlicher Launch: ARC_GATE_ENABLED=false in Vercel setzen.
 */
export const GATE_COOKIE = 'arc_gate'

/** Tor aktiv nur auf Vercel und solange nicht per Kill-Switch deaktiviert. */
export function isGateEnabled(): boolean {
  if (!process.env.VERCEL) return false
  return process.env.ARC_GATE_ENABLED !== 'false'
}

/** Pfade, die waehrend der Sperre erreichbar bleiben muessen. */
export function gatePathAllowed(pathname: string): boolean {
  return (
    pathname === '/coming-soon' ||
    pathname.startsWith('/api/gate') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  )
}
