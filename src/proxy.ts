import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { GATE_COOKIE, isGateEnabled, gatePathAllowed } from '@/lib/gate'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Coming-Soon-Tor (PROJ-15) — nur auf Vercel. Gesperrte Besucher sehen die
  // Coming-Soon-Seite (Rewrite, URL bleibt erhalten), bis das Unlock-Cookie passt.
  if (isGateEnabled() && !gatePathAllowed(pathname)) {
    const unlocked = request.cookies.get(GATE_COOKIE)?.value === process.env.ARC_GATE_TOKEN
    if (!unlocked) {
      const url = request.nextUrl.clone()
      url.pathname = '/coming-soon'
      return NextResponse.rewrite(url)
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session so it doesn't expire mid-visit
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verstecktes Admin-CMS: nicht eingeloggte Besucher zur Login-Seite umleiten.
  // Die feinere Admin-Pruefung (admin_profiles) erfolgt im Admin-Layout.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
