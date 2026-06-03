import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/shop/product-gallery'
import { InquiryForm } from '@/components/shop/inquiry-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import {
  PRODUCT_CATEGORY_LABELS,
  type Arc,
  type Product,
  type ProductCategory,
  type PurchaseMode,
} from '@/types'

type ShopDetailPageProps = {
  params: Promise<{ code: string }>
}

type ShopDetail = {
  code: string
  name: string
  category: ProductCategory
  description: string
  priceCents: number | null
  purchaseMode: PurchaseMode
  isSold: boolean
  isPremium: boolean
  images: string[]
  model3dUrl: string | null
  dimensions: { width: number; height: number; depth: number; weightGrams: number } | null
}

function fromProduct(p: Product): ShopDetail {
  const hasDims = p.width_cm != null && p.height_cm != null && p.depth_cm != null && p.weight_grams != null
  return {
    code: p.product_code,
    name: p.name,
    category: p.category,
    description: p.description,
    priceCents: p.price_cents,
    purchaseMode: p.purchase_mode,
    isSold: p.status === 'SOLD',
    isPremium: p.tier === 'premium_art',
    images: p.photos,
    model3dUrl: p.model_3d_url,
    dimensions: hasDims
      ? { width: p.width_cm!, height: p.height_cm!, depth: p.depth_cm!, weightGrams: p.weight_grams! }
      : null,
  }
}

function fromArc(a: Arc): ShopDetail {
  return {
    code: a.serial_number,
    name: `Arc ${a.serial_number}`,
    category: 'leuchten',
    description: a.character,
    priceCents: a.base_price,
    purchaseMode: 'direct',
    isSold: a.order_id != null,
    isPremium: false,
    images: [a.photo_front_url, a.photo_back_url].filter((u): u is string => !!u),
    model3dUrl: a.scan_3d_url,
    dimensions: { width: a.width_cm, height: a.height_cm, depth: a.depth_cm, weightGrams: a.weight_grams },
  }
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { code } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: arc }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('product_code', code)
      .eq('is_published', true)
      .neq('status', 'ARCHIVED')
      .maybeSingle(),
    supabase.from('arcs').select('*').eq('serial_number', code).eq('status', 'FIXED').maybeSingle(),
  ])

  const detail = product
    ? fromProduct(product as Product)
    : arc
      ? fromArc(arc as Arc)
      : null

  if (!detail) notFound()

  const isInquiry = detail.purchaseMode === 'inquiry'

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <Link
        href="/shop"
        className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Zurück zum Shop
      </Link>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
        {/* Gallery */}
        <div>
          <ProductGallery name={detail.name} images={detail.images} model3dUrl={detail.model3dUrl} />
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-serif text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {PRODUCT_CATEGORY_LABELS[detail.category]}
              </p>
              {detail.isPremium && <Badge className="text-[10px] tracking-[0.12em] uppercase">Premium / Art</Badge>}
              {detail.isSold && (
                <Badge variant="secondary" className="text-[10px] tracking-[0.12em] uppercase">
                  Verkauft
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal">{detail.name}</h1>
            <p className="font-medium text-2xl tabular-nums">
              {isInquiry || detail.priceCents == null ? 'Preis auf Anfrage' : formatPrice(detail.priceCents)}
            </p>
          </div>

          <Separator />

          <p className="text-base leading-relaxed font-serif whitespace-pre-line">{detail.description}</p>

          {detail.dimensions && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Abmessungen</h2>
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Breite</dt>
                  <dd className="tabular-nums">{detail.dimensions.width} cm</dd>
                  <dt className="text-muted-foreground">Höhe</dt>
                  <dd className="tabular-nums">{detail.dimensions.height} cm</dd>
                  <dt className="text-muted-foreground">Tiefe</dt>
                  <dd className="tabular-nums">{detail.dimensions.depth} cm</dd>
                  <dt className="text-muted-foreground">Gewicht</dt>
                  <dd className="tabular-nums">{(detail.dimensions.weightGrams / 1000).toFixed(1)} kg</dd>
                </dl>
              </div>
            </>
          )}

          <Separator />

          {/* CTA */}
          <div className="pt-2">
            {detail.isSold ? (
              <Button size="lg" disabled className="w-full text-xs tracking-[0.15em] uppercase">
                Verkauft
              </Button>
            ) : isInquiry ? (
              <InquiryForm productCode={detail.code} productName={detail.name} />
            ) : (
              <Button asChild size="lg" className="w-full text-xs tracking-[0.15em] uppercase">
                <Link href={`/shop/checkout/${detail.code}`}>Jetzt kaufen</Link>
              </Button>
            )}
            {!detail.isSold && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                {isInquiry
                  ? 'Einzelstück · persönliche Beratung'
                  : 'Sofort kaufen · Versand nur DE/AT/CH'}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
