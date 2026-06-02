'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ruleKey, DEFAULT_PRICING_SETTINGS } from '@/lib/pricing'
import { savePricing, type PricingRuleInput } from '@/app/admin/(dashboard)/preismatrix/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface ExistingRule {
  id: string
  component: string
  variant: string | null
  tier: string
  price_cents: number
}

export interface ExistingSettings {
  id: string
  size_klein_max_cm2: number
  size_mittel_max_cm2: number
  weight_leicht_max_g: number
  weight_mittel_max_g: number
}

const SIZE_TIERS: [string, string][] = [['klein', 'Klein'], ['mittel', 'Mittel'], ['gross', 'Groß']]
const WEIGHT_TIERS: [string, string][] = [['leicht', 'Leicht'], ['mittel', 'Mittel'], ['schwer', 'Schwer']]

interface Group {
  component: string
  title: string
  note: string
  variants: [string | null, string][]
  tiers: [string, string][]
}

const GROUPS: Group[] = [
  {
    component: 'schliff',
    title: 'Schliff (nach Größe)',
    note: 'Aufpreis fürs Schleifen je Größenklasse.',
    variants: [[null, 'Schliff']],
    tiers: SIZE_TIERS,
  },
  {
    component: 'finish',
    title: 'Finish (nach Größe)',
    note: 'Aufpreis je Finish-Typ und Größenklasse.',
    variants: [['oel', 'Öl'], ['lack', 'Lack'], ['schellack', 'Schellack']],
    tiers: SIZE_TIERS,
  },
  {
    component: 'mounting',
    title: 'Befestigung (nach Gewicht)',
    note: 'Aufpreis je Befestigung und Gewichtsklasse. Spinne = Preis pro Pendel.',
    variants: [['wand', 'Wand'], ['decke', 'Decke'], ['spinne', 'Spinne (pro Pendel)']],
    tiers: WEIGHT_TIERS,
  },
  {
    component: 'light',
    title: 'Licht (nach Größe)',
    note: 'Aufpreis je Licht-Typ und Größenklasse.',
    variants: [['porzellan', 'Porzellan'], ['bg_led', 'Hintergrund LED'], ['true_led', 'True Light LED']],
    tiers: SIZE_TIERS,
  },
]

function centsToEuro(cents: number): string {
  return (cents / 100).toString()
}

function euroToCents(euro: string): number {
  if (!euro.trim()) return 0
  return Math.round(Number(euro) * 100)
}

export function PricingEditor({
  rules,
  settings,
}: {
  rules: ExistingRule[]
  settings: ExistingSettings | null
}) {
  const router = useRouter()

  // Lookups aus den bestehenden Regeln
  const idByKey: Record<string, string> = {}
  const initialPrices: Record<string, string> = {}
  for (const r of rules) {
    const key = ruleKey(r.component, r.variant, r.tier)
    idByKey[key] = r.id
    initialPrices[key] = centsToEuro(r.price_cents)
  }

  const [prices, setPrices] = useState<Record<string, string>>(initialPrices)
  const [sizeKlein, setSizeKlein] = useState(String(settings?.size_klein_max_cm2 ?? DEFAULT_PRICING_SETTINGS.size_klein_max_cm2))
  const [sizeMittel, setSizeMittel] = useState(String(settings?.size_mittel_max_cm2 ?? DEFAULT_PRICING_SETTINGS.size_mittel_max_cm2))
  const [weightLeicht, setWeightLeicht] = useState(String(settings?.weight_leicht_max_g ?? DEFAULT_PRICING_SETTINGS.weight_leicht_max_g))
  const [weightMittel, setWeightMittel] = useState(String(settings?.weight_mittel_max_g ?? DEFAULT_PRICING_SETTINGS.weight_mittel_max_g))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function setPrice(key: string, value: string) {
    setPrices((prev) => ({ ...prev, [key]: value }))
  }

  function clientValidate(sizeK: number, sizeM: number, weightL: number, weightM: number): string | null {
    if (sizeK <= 0 || sizeM <= 0 || weightL <= 0 || weightM <= 0) return 'Alle Grenzwerte muessen groesser als 0 sein.'
    if (sizeK >= sizeM) return 'Groesse: klein-max muss kleiner als mittel-max sein.'
    if (weightL >= weightM) return 'Gewicht: leicht-max muss kleiner als mittel-max sein.'
    for (const group of GROUPS) {
      for (const [variant] of group.variants) {
        for (const [tier] of group.tiers) {
          const key = ruleKey(group.component, variant, tier)
          const raw = prices[key] ?? ''
          if (raw.trim() && (Number.isNaN(Number(raw)) || Number(raw) < 0)) {
            return 'Preise muessen 0 oder groesser sein.'
          }
        }
      }
    }
    return null
  }

  async function handleSave() {
    setError(null)
    const sizeK = Math.round(Number(sizeKlein))
    const sizeM = Math.round(Number(sizeMittel))
    const weightL = Math.round(Number(weightLeicht))
    const weightM = Math.round(Number(weightMittel))

    const validationError = clientValidate(sizeK, sizeM, weightL, weightM)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    const ruleInputs: PricingRuleInput[] = []
    for (const group of GROUPS) {
      for (const [variant] of group.variants) {
        for (const [tier] of group.tiers) {
          const key = ruleKey(group.component, variant, tier)
          ruleInputs.push({
            id: idByKey[key],
            component: group.component,
            variant,
            tier,
            price_cents: euroToCents(prices[key] ?? ''),
          })
        }
      }
    }

    setSaving(true)
    const res = await savePricing(ruleInputs, {
      id: settings?.id,
      size_klein_max_cm2: sizeK,
      size_mittel_max_cm2: sizeM,
      weight_leicht_max_g: weightL,
      weight_mittel_max_g: weightM,
    })
    setSaving(false)

    if (res.error) {
      setError(res.error)
      toast.error(res.error)
      return
    }
    toast.success('Preismatrix gespeichert.')
    router.refresh()
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Preismatrix</h1>
        <p className="text-sm text-muted-foreground">
          Aufpreise in Euro. Werden vom Konfigurator direkt verwendet.
        </p>
      </div>

      {GROUPS.map((group) => (
        <Card key={group.component}>
          <CardHeader>
            <CardTitle className="text-base">{group.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{group.note}</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48" />
                  {group.tiers.map(([tier, label]) => (
                    <TableHead key={tier} className="text-center">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.variants.map(([variant, vLabel]) => (
                  <TableRow key={variant ?? 'schliff'}>
                    <TableCell className="font-medium">{vLabel}</TableCell>
                    {group.tiers.map(([tier]) => {
                      const key = ruleKey(group.component, variant, tier)
                      return (
                        <TableCell key={tier}>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={prices[key] ?? ''}
                              placeholder="0"
                              onChange={(e) => setPrice(key, e.target.value)}
                              className="text-right tabular-nums"
                            />
                            <span className="text-xs text-muted-foreground">€</span>
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Klassen-Grenzwerte</CardTitle>
          <p className="text-xs text-muted-foreground">
            Bestimmen, in welche Größen-/Gewichtsklasse ein Arc fällt.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium">Größe (Fläche = Breite × Höhe, cm²)</p>
            <div className="space-y-1.5">
              <Label>Klein bis max. (cm²)</Label>
              <Input type="number" min="1" value={sizeKlein} onChange={(e) => setSizeKlein(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mittel bis max. (cm²)</Label>
              <Input type="number" min="1" value={sizeMittel} onChange={(e) => setSizeMittel(e.target.value)} />
              <p className="text-xs text-muted-foreground">Darüber = Groß.</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Gewicht (g)</p>
            <div className="space-y-1.5">
              <Label>Leicht bis max. (g)</Label>
              <Input type="number" min="1" value={weightLeicht} onChange={(e) => setWeightLeicht(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mittel bis max. (g)</Label>
              <Input type="number" min="1" value={weightMittel} onChange={(e) => setWeightMittel(e.target.value)} />
              <p className="text-xs text-muted-foreground">Darüber = Schwer.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Wird gespeichert …' : 'Preismatrix speichern'}
        </Button>
      </div>
    </div>
  )
}
