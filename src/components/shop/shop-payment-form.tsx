'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { stripePromise } from '@/lib/stripe-client'
import { formatPrice } from '@/lib/utils'

function PaymentFormInner({ total }: { total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setSubmitting(true)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/shop/checkout/bestaetigung`,
      },
    })

    // Nur erreicht, wenn kein Redirect erfolgte (also Fehler)
    if (stripeError) {
      setError(stripeError.message ?? 'Zahlung fehlgeschlagen — bitte eine andere Zahlungsmethode versuchen.')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full text-xs tracking-[0.15em] uppercase"
        size="lg"
      >
        {submitting ? 'Wird verarbeitet …' : `Jetzt zahlen — ${formatPrice(total)}`}
      </Button>
    </form>
  )
}

type ShopPaymentFormProps = {
  clientSecret: string
  total: number
}

export function ShopPaymentForm({ clientSecret, total }: ShopPaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: 'de' }}>
      <PaymentFormInner total={total} />
    </Elements>
  )
}
