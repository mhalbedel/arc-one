'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const inquirySchema = z.object({
  name: z.string().min(1, 'Pflichtfeld'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Pflichtfeld'),
})

type InquiryFormValues = z.infer<typeof inquirySchema>

type InquiryFormProps = {
  productCode: string
  productName: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive mt-1">{message}</p>
}

export function InquiryForm({ productCode, productName }: InquiryFormProps) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({ resolver: zodResolver(inquirySchema) })

  async function onSubmit(values: InquiryFormValues) {
    setSubmitError(null)
    try {
      const res = await fetch('/api/shop/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode, ...values }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setSubmitError(data?.error ?? 'Anfrage konnte nicht gesendet werden.')
        return
      }
      setSent(true)
      reset()
    } catch {
      setSubmitError('Anfrage konnte nicht gesendet werden.')
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Zustand zurücksetzen, wenn der Dialog geschlossen wird
      setSent(false)
      setSubmitError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full text-xs tracking-[0.15em] uppercase">
          Anfrage senden
        </Button>
      </DialogTrigger>
      <DialogContent>
        {sent ? (
          <div className="space-y-3 py-2 text-center">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-normal">Danke für Ihre Anfrage</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Wir melden uns in Kürze bei Ihnen zu „{productName}".
            </p>
            <Button
              variant="outline"
              className="mt-2 text-xs tracking-[0.15em] uppercase"
              onClick={() => handleOpenChange(false)}
            >
              Schließen
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-normal">Anfrage zu „{productName}"</DialogTitle>
              <DialogDescription>
                Hinterlassen Sie Ihre Kontaktdaten — wir beraten Sie persönlich zu diesem Einzelstück.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="name" className="text-xs text-muted-foreground">Name *</Label>
                <Input id="name" {...register('name')} className="mt-1" />
                <FieldError message={errors.name?.message} />
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
              <div>
                <Label htmlFor="message" className="text-xs text-muted-foreground">Nachricht *</Label>
                <Textarea id="message" rows={4} {...register('message')} className="mt-1" />
                <FieldError message={errors.message?.message} />
              </div>
              {submitError && <p className="text-xs text-destructive">{submitError}</p>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-xs tracking-[0.15em] uppercase"
                size="lg"
              >
                {isSubmitting ? 'Wird gesendet …' : 'Anfrage absenden'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
