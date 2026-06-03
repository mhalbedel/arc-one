import Link from 'next/link'
import { ShopCheckoutClient } from '@/components/shop/shop-checkout-client'

export default function ShopCheckoutPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <Link
        href="/warenkorb"
        className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Zurück zum Warenkorb
      </Link>
      <div className="mt-8">
        <ShopCheckoutClient />
      </div>
    </main>
  )
}
