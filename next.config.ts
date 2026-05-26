import type { NextConfig } from "next";

const requiredAtBuild = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const
const missing = requiredAtBuild.filter((key) => !process.env[key])
if (missing.length > 0) {
  throw new Error(
    `[ARC-ONE] Fehlende Umgebungsvariablen in .env.local:\n` +
    missing.map((k) => `  • ${k}`).join('\n')
  )
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[ARC-ONE] SUPABASE_SERVICE_ROLE_KEY fehlt — Admin-API-Routes werden nicht funktionieren.')
}

const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHostname },
    ],
  },
};

export default nextConfig;
