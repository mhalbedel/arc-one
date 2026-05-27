'use client'

import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { stripePromise } from '@/lib/stripe-client'
import { formatPrice } from '@/lib/utils'

type PaymentFormInnerProps = {
  arcId: string
  depositAmount: number
}

function PaymentFormInner({ arcId, depositAmount }: PaymentFormInnerProps) {
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
        return_url: `${window.location.origin}/checkout/${arcId}/bestaetigung`,
      },
    })

    // Only reached if redirect didn't happen (i.e. error)
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
        {submitting ? 'Wird verarbeitet …' : `Jetzt zahlen — ${formatPrice(depositAmount)} Deposit`}
      </Button>
    </form>
  )
}

type StripePaymentFormProps = {
  clientSecret: string
  arcId: string
  depositAmount: number
}

export function StripePaymentForm({ clientSecret, arcId, depositAmount }: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: 'de' }}>
      <PaymentFormInner arcId={arcId} depositAmount={depositAmount} />
    </Elements>
  )
}
