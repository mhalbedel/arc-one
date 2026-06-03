'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  saveProduct,
  deleteProduct,
  setProductStatus,
  type ProductInput,
} from '@/app/admin/(dashboard)/shop/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { PRODUCT_CATEGORIES, type Product, type ProductCategory, type ProductTier, type PurchaseMode } from '@/types'

const TIERS: { value: ProductTier; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium_art', label: 'Premium / Art' },
]

const MODES: { value: PurchaseMode; label: string }[] = [
  { value: 'direct', label: 'Direktkauf' },
  { value: 'inquiry', label: 'Anfrage' },
]

const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const MAX_SCAN_BYTES = 50 * 1024 * 1024

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'produkt'
}

async function uploadFile(file: File, folder: string, prefix: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `products/${folder}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const { error } = await supabase.storage.from('arcs-media').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  return supabase.storage.from('arcs-media').getPublicUrl(path).data.publicUrl
}

function toEuro(cents: number | null): string {
  return cents == null ? '' : (cents / 100).toString()
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const isEdit = Boolean(product)

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? 'leuchten')
  const [tier, setTier] = useState<ProductTier>(product?.tier ?? 'standard')
  const [mode, setMode] = useState<PurchaseMode>(product?.purchase_mode ?? 'direct')
  const [priceEur, setPriceEur] = useState(toEuro(product?.price_cents ?? null))
  const [shippingEur, setShippingEur] = useState(toEuro(product?.shipping_override_cents ?? null))
  const [width, setWidth] = useState(product?.width_cm != null ? String(product.width_cm) : '')
  const [height, setHeight] = useState(product?.height_cm != null ? String(product.height_cm) : '')
  const [depth, setDepth] = useState(product?.depth_cm != null ? String(product.depth_cm) : '')
  const [weight, setWeight] = useState(product?.weight_grams != null ? String(product.weight_grams) : '')
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false)

  const [photos, setPhotos] = useState<string[]>(product?.photos ?? [])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [scanUrl, setScanUrl] = useState<string | null>(product?.model_3d_url ?? null)
  const [scanFile, setScanFile] = useState<File | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const photoCount = photos.length + newPhotos.length

  function validate(): Record<string, string> {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name ist erforderlich.'
    if (!description.trim()) e.description = 'Beschreibung ist erforderlich.'
    if (photoCount === 0) e.photos = 'Mindestens ein Foto ist erforderlich.'
    if (mode === 'direct') {
      const p = Number(priceEur)
      if (!priceEur || Number.isNaN(p) || p <= 0) e.price = 'Direktkauf benötigt einen gültigen Preis.'
    }
    if (shippingEur) {
      const s = Number(shippingEur)
      if (Number.isNaN(s) || s < 0) e.shipping = 'Ungültiger Versandpreis.'
    }
    return e
  }

  function addPhotoFiles(files: FileList | null) {
    if (!files) return
    const valid: File[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`„${file.name}" ist keine Bilddatei.`)
        continue
      }
      if (file.size > MAX_PHOTO_BYTES) {
        toast.error(`„${file.name}" ist zu groß (max. 10 MB).`)
        continue
      }
      valid.push(file)
    }
    setNewPhotos((prev) => [...prev, ...valid])
  }

  function pickScan(file: File | null) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.glb')) {
      toast.error('Bitte eine .glb-Datei wählen.')
      return
    }
    if (file.size > MAX_SCAN_BYTES) {
      toast.error('Datei zu groß (max. 50 MB).')
      return
    }
    setScanFile(file)
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      toast.error('Bitte Pflichtfelder prüfen.')
      return
    }

    setSaving(true)
    try {
      const folder = slugify(name)
      let allPhotos = [...photos]
      let nextScan = scanUrl
      try {
        for (const file of newPhotos) {
          allPhotos.push(await uploadFile(file, folder, 'foto'))
        }
        if (scanFile) nextScan = await uploadFile(scanFile, folder, '3d')
      } catch (uploadErr) {
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Upload fehlgeschlagen.'
        toast.error(`Medien-Upload fehlgeschlagen: ${msg}`)
        setSaving(false)
        return
      }

      const input: ProductInput = {
        id: product?.id,
        name: name.trim(),
        description: description.trim(),
        category,
        tier,
        purchase_mode: mode,
        price_cents: mode === 'direct' ? Math.round(Number(priceEur) * 100) : null,
        shipping_override_cents: shippingEur ? Math.round(Number(shippingEur) * 100) : null,
        photos: allPhotos,
        model_3d_url: nextScan,
        width_cm: width ? Number(width) : null,
        height_cm: height ? Number(height) : null,
        depth_cm: depth ? Number(depth) : null,
        weight_grams: weight ? Math.round(Number(weight)) : null,
        is_published: isPublished,
      }

      const res = await saveProduct(input)
      if (res.error) {
        toast.error(res.error)
        setSaving(false)
        return
      }
      toast.success(isEdit ? 'Produkt gespeichert.' : 'Produkt angelegt.')
      router.push('/admin/shop')
      router.refresh()
    } catch {
      toast.error('Speichern fehlgeschlagen. Bitte erneut versuchen.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!product) return
    const res = await deleteProduct(product.id)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Produkt gelöscht.')
    router.push('/admin/shop')
    router.refresh()
  }

  async function handleArchive() {
    if (!product) return
    const res = await setProductStatus(product.id, 'ARCHIVED')
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Produkt archiviert.')
    router.push('/admin/shop')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEdit ? product!.name : 'Neues Produkt'}
          {isEdit && <span className="ml-2 text-sm font-normal text-muted-foreground">{product!.product_code}</span>}
        </h1>
        {isEdit && (
          <div className="flex gap-2">
            {product!.status !== 'ARCHIVED' && (
              <Button type="button" variant="outline" onClick={handleArchive}>
                Archivieren
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline">
                  Löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Produkt löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Das Produkt wird dauerhaft entfernt. Mit verknüpften Bestellungen/Anfragen ist nur
                    Archivieren möglich.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Stammdaten */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Stammdaten</h2>
        <Field label="Name *" error={errors.name}>
          {(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Beschreibung *" error={errors.description}>
          {(id) => <Textarea id={id} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Kategorie">
            {(id) => (
              <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
          <Field label="Tier">
            {(id) => (
              <Select value={tier} onValueChange={(v) => setTier(v as ProductTier)}>
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
          <Field label="Kaufmodus">
            {(id) => (
              <Select value={mode} onValueChange={(v) => setMode(v as PurchaseMode)}>
                <SelectTrigger id={id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={mode === 'direct' ? 'Preis (EUR) *' : 'Preis (EUR)'}
            error={errors.price}
          >
            {(id) => (
              <Input
                id={id}
                type="number"
                step="0.01"
                min="0"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                disabled={mode === 'inquiry'}
                placeholder={mode === 'inquiry' ? 'Preis auf Anfrage' : ''}
              />
            )}
          </Field>
          <Field label="Versand-Override (EUR, optional)" error={errors.shipping}>
            {(id) => (
              <Input
                id={id}
                type="number"
                step="0.01"
                min="0"
                value={shippingEur}
                onChange={(e) => setShippingEur(e.target.value)}
                placeholder="leer = Standard je Land"
              />
            )}
          </Field>
        </div>
      </section>

      <Separator />

      {/* Maße */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Maße (optional)</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Breite (cm)">
            {(id) => <Input id={id} type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} />}
          </Field>
          <Field label="Höhe (cm)">
            {(id) => <Input id={id} type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />}
          </Field>
          <Field label="Tiefe (cm)">
            {(id) => <Input id={id} type="number" step="0.1" value={depth} onChange={(e) => setDepth(e.target.value)} />}
          </Field>
          <Field label="Gewicht (g)">
            {(id) => <Input id={id} type="number" step="1" value={weight} onChange={(e) => setWeight(e.target.value)} />}
          </Field>
        </div>
      </section>

      <Separator />

      {/* Medien */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Fotos *</h2>
        {errors.photos && <p className="text-xs text-destructive">{errors.photos}</p>}
        <div className="flex flex-wrap gap-3">
          {photos.map((url) => (
            <div key={url} className="relative">
              <Image src={url} alt="" width={80} height={80} className="h-20 w-20 rounded object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((u) => u !== url))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background"
                aria-label="Foto entfernen"
              >
                ×
              </button>
            </div>
          ))}
          {newPhotos.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                neu
              </div>
              <button
                type="button"
                onClick={() => setNewPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background"
                aria-label="Foto entfernen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Input type="file" accept="image/*" multiple onChange={(e) => addPhotoFiles(e.target.files)} className="max-w-xs" />
      </section>

      <section className="space-y-2">
        <Label htmlFor="scan">3D-Modell (.glb, optional)</Label>
        <Input id="scan" type="file" accept=".glb,model/gltf-binary" onChange={(e) => pickScan(e.target.files?.[0] ?? null)} className="max-w-xs" />
        {scanFile ? (
          <p className="text-xs text-muted-foreground">{scanFile.name}</p>
        ) : scanUrl ? (
          <p className="text-xs text-muted-foreground">
            Vorhandenes Modell ·{' '}
            <button type="button" className="underline" onClick={() => setScanUrl(null)}>
              entfernen
            </button>
          </p>
        ) : null}
      </section>

      <Separator />

      {/* Sichtbarkeit */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Sichtbarkeit</h2>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          Im Shop veröffentlicht (unabhängig vom Verkaufsstatus)
        </label>
      </section>

      <Separator />

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Wird gespeichert …' : isEdit ? 'Speichern' : 'Produkt anlegen'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/shop')} disabled={saving}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
