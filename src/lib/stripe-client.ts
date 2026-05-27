import { loadStripe } from '@stripe/stripe-js'

// Singleton — loadStripe caches the promise internally
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)
