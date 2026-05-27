'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ShippingCountry } from '@/types'

const addressSchema = z.object({
  street: z.string().min(1, 'Pflichtfeld'),
  zip: z.string().regex(/^\d{4,5}$/, 'Ungültige PLZ (4–5 Ziffern)'),
  city: z.string().min(1, 'Pflichtfeld'),
  country: z.enum(['DE', 'AT', 'CH'], { message: 'Bitte wählen' }),
})

export const contactSchema = z
  .object({
    firstName: z.string().min(1, 'Pflichtfeld'),
    lastName: z.string().min(1, 'Pflichtfeld'),
    email: z.string().email('Ungültige E-Mail-Adresse'),
    phone: z.string().optional(),
    sameAsBilling: z.boolean(),
  })
  .merge(addressSchema.omit({ country: true }).extend({ country: z.enum(['DE', 'AT', 'CH'], { message: 'Bitte wählen' }) }))
  .extend({
    billingStreet: z.string().optional(),
    billingZip: z.string().optional(),
    billingCity: z.string().optional(),
    billingCountry: z.enum(['DE', 'AT', 'CH']).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.sameAsBilling) {
      if (!data.billingStreet) ctx.addIssue({ code: 'custom', path: ['billingStreet'], message: 'Pflichtfeld' })
      if (!data.billingZip || !/^\d{4,5}$/.test(data.billingZip))
        ctx.addIssue({ code: 'custom', path: ['billingZip'], message: 'Ungültige PLZ' })
      if (!data.billingCity) ctx.addIssue({ code: 'custom', path: ['billingCity'], message: 'Pflichtfeld' })
      if (!data.billingCountry) ctx.addIssue({ code: 'custom', path: ['billingCountry'], message: 'Bitte wählen' })
    }
  })

export type ContactFormValues = z.infer<typeof contactSchema>

type ContactFormProps = {
  onSubmit: (values: ContactFormValues) => void
  onCountryChange: (country: ShippingCountry) => void
  submitting: boolean
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive mt-1">{message}</p>
}

export function ContactForm({ onSubmit, onCountryChange, submitting }: ContactFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { sameAsBilling: true, country: 'DE' },
  })

  const sameAsBilling = watch('sameAsBilling')
  const country = watch('country')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Persönliche Daten */}
      <div className="space-y-4">
        <h3 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Persönliche Daten</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" className="text-xs text-muted-foreground">Vorname *</Label>
            <Input id="firstName" {...register('firstName')} className="mt-1" />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-xs text-muted-foreground">Nachname *</Label>
            <Input id="lastName" {...register('lastName')} className="mt-1" />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="text-xs text-muted-foreground">E-Mail *</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1" />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="phone" className="text-xs text-muted-foreground">Telefon</Label>
          <Input id="phone" type="tel" {...register('phone')} className="mt-1" />
        </div>
      </div>

      {/* Lieferadresse */}
      <div className="space-y-4">
        <h3 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Lieferadresse</h3>
        <div>
          <Label htmlFor="street" className="text-xs text-muted-foreground">Straße & Hausnummer *</Label>
          <Input id="street" {...register('street')} className="mt-1" />
          <FieldError message={errors.street?.message} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="zip" className="text-xs text-muted-foreground">PLZ *</Label>
            <Input id="zip" {...register('zip')} className="mt-1" />
            <FieldError message={errors.zip?.message} />
          </div>
          <div>
            <Label htmlFor="city" className="text-xs text-muted-foreground">Stadt *</Label>
            <Input id="city" {...register('city')} className="mt-1" />
            <FieldError message={errors.city?.message} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Land *</Label>
          <Select
            value={country}
            onValueChange={(val) => {
              setValue('country', val as ShippingCountry)
              onCountryChange(val as ShippingCountry)
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Land wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DE">Deutschland</SelectItem>
              <SelectItem value="AT">Österreich</SelectItem>
              <SelectItem value="CH">Schweiz</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.country?.message} />
        </div>
      </div>

      {/* Rechnungsadresse */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="sameAsBilling"
            checked={sameAsBilling}
            onCheckedChange={(checked) => setValue('sameAsBilling', !!checked)}
          />
          <Label htmlFor="sameAsBilling" className="text-sm cursor-pointer">
            Rechnungsadresse entspricht Lieferadresse
          </Label>
        </div>

        {!sameAsBilling && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Rechnungsadresse</h3>
            <div>
              <Label htmlFor="billingStreet" className="text-xs text-muted-foreground">Straße & Hausnummer *</Label>
              <Input id="billingStreet" {...register('billingStreet')} className="mt-1" />
              <FieldError message={errors.billingStreet?.message} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="billingZip" className="text-xs text-muted-foreground">PLZ *</Label>
                <Input id="billingZip" {...register('billingZip')} className="mt-1" />
                <FieldError message={errors.billingZip?.message} />
              </div>
              <div>
                <Label htmlFor="billingCity" className="text-xs text-muted-foreground">Stadt *</Label>
                <Input id="billingCity" {...register('billingCity')} className="mt-1" />
                <FieldError message={errors.billingCity?.message} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Land *</Label>
              <Select
                defaultValue="DE"
                onValueChange={(val) => setValue('billingCountry', val as ShippingCountry)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Land wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DE">Deutschland</SelectItem>
                  <SelectItem value="AT">Österreich</SelectItem>
                  <SelectItem value="CH">Schweiz</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.billingCountry?.message} />
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full text-xs tracking-[0.15em] uppercase"
        size="lg"
      >
        {submitting ? 'Wird vorbereitet …' : 'Weiter zur Zahlung'}
      </Button>
    </form>
  )
}
