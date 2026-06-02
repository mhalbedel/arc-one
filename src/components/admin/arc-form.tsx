'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { saveArc, archiveArc, type ArcInput } from '@/app/admin/(dashboard)/arcs/actions'
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
import type { Arc, ArcStatus } from '@/types'

const ARC_STATUSES: ArcStatus[] = [
  'RAW',
  'IN_PROGRESS',
  'READY',
  'RESERVED',
  'ORDERED',
  'IN_PRODUCTION',
  'SHIPPED',
  'SOLD',
  'ARCHIVED',
]

// Manueller System-Status — UI weist auf moegliche Inkonsistenz hin
const SYSTEM_STATUSES: ArcStatus[] = ['RESERVED', 'ORDERED']

const OPTION_GROUPS: { component: string; label: string; options: [string, string][] }[] = [
  { component: 'schliff', label: 'Schliff', options: [['schleifen', 'Schleifen lassen'], ['rohling', 'Rohling']] },
  { component: 'mounting', label: 'Befestigung', options: [['wand', 'Wand'], ['decke', 'Decke'], ['spinne', 'Spinne'], ['ohne', 'Ohne']] },
  { component: 'finish', label: 'Finish', options: [['unbehandelt', 'Unbehandelt'], ['oel', 'Öl'], ['lack', 'Lack'], ['schellack', 'Schellack']] },
  { component: 'light', label: 'Licht', options: [['porzellan', 'Porzellan'], ['bg_led', 'Hintergrund LED'], ['true_led', 'True Light LED'], ['ohne', 'Ohne']] },
]

const MAX_PHOTO_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_SCAN_BYTES = 50 * 1024 * 1024 // 50 MB

type MediaField = 'front' | 'back' | 'scan'

async function uploadMedia(file: File, field: MediaField, serial: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const slug = serial.trim().replace(/[^a-zA-Z0-9-_]/g, '_') || 'arc'
  const path = `${slug}/${field}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('arcs-media').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  return supabase.storage.from('arcs-media').getPublicUrl(path).data.publicUrl
}

function toEuro(cents: number): string {
  return (cents / 100).toString()
}

export function ArcForm({ arc }: { arc?: Arc }) {
  const router = useRouter()
  const isEdit = Boolean(arc)

  const [serial, setSerial] = useState(arc?.serial_number ?? '')
  const [basePriceEur, setBasePriceEur] = useState(arc ? toEuro(arc.base_price) : '')
  const [width, setWidth] = useState(arc ? String(arc.width_cm) : '')
  const [height, setHeight] = useState(arc ? String(arc.height_cm) : '')
  const [depth, setDepth] = useState(arc ? String(arc.depth_cm) : '')
  const [weight, setWeight] = useState(arc ? String(arc.weight_grams) : '')
  const [character, setCharacter] = useState(arc?.character ?? '')
  const [harvestDate, setHarvestDate] = useState(arc?.harvest_date ? arc.harvest_date.slice(0, 10) : '')
  const [forestSection, setForestSection] = useState(arc?.forest_section ?? '')
  const [cutNumber, setCutNumber] = useState(arc?.cut_number != null ? String(arc.cut_number) : '')
  const [status, setStatus] = useState<ArcStatus>(arc?.status ?? 'RAW')
  const [isSanded, setIsSanded] = useState(arc?.is_sanded ?? false)
  const [isFeatured, setIsFeatured] = useState(arc?.is_featured ?? false)
  const [maxSpinne, setMaxSpinne] = useState(arc?.max_spinne_pendants != null ? String(arc.max_spinne_pendants) : '')
  const [blocked, setBlocked] = useState<string[]>(arc?.blocked_options ?? [])

  const [frontUrl, setFrontUrl] = useState(arc?.photo_front_url ?? null)
  const [backUrl, setBackUrl] = useState(arc?.photo_back_url ?? null)
  const [scanUrl, setScanUrl] = useState(arc?.scan_3d_url ?? null)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [scanFile, setScanFile] = useState<File | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  function toggleOption(key: string, available: boolean) {
    setBlocked((prev) => (available ? prev.filter((k) => k !== key) : [...new Set([...prev, key])]))
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {}
    if (!serial.trim()) e.serial = 'Seriennummer ist erforderlich.'
    const price = Number(basePriceEur)
    if (!basePriceEur || Number.isNaN(price) || price <= 0) e.basePrice = 'Gueltiger Basispreis erforderlich.'
    for (const [k, v, label] of [
      ['width', width, 'Breite'],
      ['height', height, 'Hoehe'],
      ['depth', depth, 'Tiefe'],
      ['weight', weight, 'Gewicht'],
    ] as const) {
      const n = Number(v)
      if (!v || Number.isNaN(n) || n <= 0) e[k] = `${label} ist erforderlich.`
    }
    return e
  }

  function pickFile(
    file: File | null,
    setFile: (f: File | null) => void,
    kind: 'photo' | 'scan',
  ) {
    if (!file) {
      setFile(null)
      return
    }
    if (kind === 'photo' && !file.type.startsWith('image/')) {
      toast.error('Bitte eine Bilddatei waehlen.')
      return
    }
    if (kind === 'scan' && !file.name.toLowerCase().endsWith('.glb')) {
      toast.error('Bitte eine .glb-Datei waehlen.')
      return
    }
    const max = kind === 'photo' ? MAX_PHOTO_BYTES : MAX_SCAN_BYTES
    if (file.size > max) {
      toast.error(`Datei zu gross (max. ${Math.round(max / 1024 / 1024)} MB).`)
      return
    }
    setFile(file)
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      toast.error('Bitte Pflichtfelder pruefen.')
      return
    }

    setSaving(true)
    try {
      let nextFront = frontUrl
      let nextBack = backUrl
      let nextScan = scanUrl
      try {
        if (frontFile) nextFront = await uploadMedia(frontFile, 'front', serial)
        if (backFile) nextBack = await uploadMedia(backFile, 'back', serial)
        if (scanFile) nextScan = await uploadMedia(scanFile, 'scan', serial)
      } catch (uploadErr) {
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Upload fehlgeschlagen.'
        toast.error(`Medien-Upload fehlgeschlagen: ${msg}`)
        setSaving(false)
        return
      }

      const input: ArcInput = {
        id: arc?.id,
        serial_number: serial.trim(),
        base_price: Math.round(Number(basePriceEur) * 100),
        width_cm: Number(width),
        height_cm: Number(height),
        depth_cm: Number(depth),
        weight_grams: Math.round(Number(weight)),
        character: character.trim(),
        harvest_date: harvestDate || null,
        forest_section: forestSection.trim() || null,
        cut_number: cutNumber ? Math.round(Number(cutNumber)) : null,
        status,
        is_sanded: isSanded,
        is_featured: isFeatured,
        max_spinne_pendants: maxSpinne ? Math.round(Number(maxSpinne)) : null,
        blocked_options: blocked,
        photo_front_url: nextFront,
        photo_back_url: nextBack,
        scan_3d_url: nextScan,
      }

      const res = await saveArc(input)
      if (res.error) {
        if (res.error.includes('Seriennummer')) setErrors((p) => ({ ...p, serial: res.error! }))
        toast.error(res.error)
        setSaving(false)
        return
      }
      toast.success(isEdit ? 'Arc gespeichert.' : 'Arc angelegt.')
      router.push('/admin/arcs')
      router.refresh()
    } catch {
      toast.error('Speichern fehlgeschlagen. Bitte erneut versuchen.')
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!arc) return
    const res = await archiveArc(arc.id)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Arc archiviert.')
    router.push('/admin/arcs')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? `Arc ${arc!.serial_number}` : 'Neuer Arc'}</h1>
        {isEdit && status !== 'ARCHIVED' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">
                Archivieren
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arc archivieren?</AlertDialogTitle>
                <AlertDialogDescription>
                  Der Arc erhaelt den Status ARCHIVED und verschwindet aus dem Katalog. Verknuepfte
                  Bestellungen bleiben erhalten. Dies ist kein Loeschen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchive}>Archivieren</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Stammdaten */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Stammdaten</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Seriennummer *" error={errors.serial}>
            <Input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="z.B. ARC-001" />
          </Field>
          <Field label="Basispreis (EUR) *" error={errors.basePrice}>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={basePriceEur}
              onChange={(e) => setBasePriceEur(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Breite (cm) *" error={errors.width}>
            <Input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} />
          </Field>
          <Field label="Hoehe (cm) *" error={errors.height}>
            <Input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
          </Field>
          <Field label="Tiefe (cm) *" error={errors.depth}>
            <Input type="number" step="0.1" value={depth} onChange={(e) => setDepth(e.target.value)} />
          </Field>
          <Field label="Gewicht (g) *" error={errors.weight}>
            <Input type="number" step="1" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </Field>
        </div>
        <Field label="Charakter (Katalogtext)">
          <Textarea value={character} onChange={(e) => setCharacter(e.target.value)} rows={3} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Erntedatum">
            <Input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
          </Field>
          <Field label="Waldabschnitt">
            <Input value={forestSection} onChange={(e) => setForestSection(e.target.value)} />
          </Field>
          <Field label="Schnittnummer">
            <Input type="number" value={cutNumber} onChange={(e) => setCutNumber(e.target.value)} />
          </Field>
        </div>
      </section>

      <Separator />

      {/* Status & Flags */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <Select value={status} onValueChange={(v) => setStatus(v as ArcStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARC_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {SYSTEM_STATUSES.includes(status) && (
              <p className="text-xs text-amber-700">
                System-Status — wird normalerweise vom Konfigurator/Checkout gesetzt.
              </p>
            )}
          </Field>
          <div className="flex flex-col justify-end gap-3 pb-1">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isSanded} onCheckedChange={setIsSanded} />
              Bereits geschliffen (kein Schliff-Schritt)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              Auf Startseite hervorheben
            </label>
          </div>
        </div>
      </section>

      <Separator />

      {/* Verfuegbare Optionen */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Verfuegbare Optionen</h2>
        <p className="text-xs text-muted-foreground">
          Standardmaessig sind alle Optionen verfuegbar. Schalte aus, was fuer diesen Arc nicht moeglich ist.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {OPTION_GROUPS.map((group) => (
            <div key={group.component} className="space-y-2">
              <p className="text-sm font-medium">{group.label}</p>
              {group.options.map(([value, label]) => {
                const key = `${group.component}:${value}`
                const available = !blocked.includes(key)
                return (
                  <label key={key} className="flex items-center justify-between text-sm">
                    <span className={available ? '' : 'text-muted-foreground line-through'}>{label}</span>
                    <Switch checked={available} onCheckedChange={(c) => toggleOption(key, c)} />
                  </label>
                )
              })}
            </div>
          ))}
        </div>
        <Field label="Max. Spinnen-Pendants">
          <Input
            type="number"
            min="1"
            value={maxSpinne}
            onChange={(e) => setMaxSpinne(e.target.value)}
            placeholder="leer = Spinne nicht waehlbar"
            className="max-w-xs"
          />
        </Field>
      </section>

      <Separator />

      {/* Medien */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Medien</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <MediaInput
            label="Foto Seite A"
            url={frontUrl}
            file={frontFile}
            accept="image/*"
            onPick={(f) => pickFile(f, setFrontFile, 'photo')}
          />
          <MediaInput
            label="Foto Seite B"
            url={backUrl}
            file={backFile}
            accept="image/*"
            onPick={(f) => pickFile(f, setBackFile, 'photo')}
          />
        </div>
        <MediaInput
          label="3D-Scan (.glb, optional)"
          url={scanUrl}
          file={scanFile}
          accept=".glb,model/gltf-binary"
          onPick={(f) => pickFile(f, setScanFile, 'scan')}
          isModel
        />
      </section>

      <Separator />

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Wird gespeichert …' : isEdit ? 'Speichern' : 'Arc anlegen'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/arcs')} disabled={saving}>
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
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function MediaInput({
  label,
  url,
  file,
  accept,
  onPick,
  isModel,
}: {
  label: string
  url: string | null
  file: File | null
  accept: string
  onPick: (file: File | null) => void
  isModel?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {!isModel && url && !file ? (
          <Image
            src={url}
            alt={label}
            width={56}
            height={56}
            className="h-14 w-14 rounded object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
            {file ? 'neu' : url ? 'vorh.' : '—'}
          </div>
        )}
        <Input
          type="file"
          accept={accept}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          className="max-w-xs"
        />
      </div>
      {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
    </div>
  )
}
