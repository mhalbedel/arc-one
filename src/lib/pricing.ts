import type { Arc, CheckoutConfig, ShippingCountry } from '@/types'
import { SHIPPING_PRICES } from '@/types'

export function calcCheckoutPrices(arc: Arc, config: CheckoutConfig, shippingCountry: ShippingCountry) {
  const sandingPrice = config.sandingChoice === 'schleifen' ? (arc.price_sanding ?? 0) : 0

  let mountingPrice = 0
  if (config.mounting === 'wand') mountingPrice = arc.price_mounting_wall ?? 0
  else if (config.mounting === 'decke') mountingPrice = arc.price_mounting_ceiling ?? 0
  else if (config.mounting === 'spinne')
    mountingPrice = (arc.price_mounting_spinne_per ?? 0) * (config.spinneCount ?? 1)

  let finishPrice = 0
  if (config.finish === 'oel') finishPrice = arc.price_finish_oil ?? 0
  else if (config.finish === 'lack') finishPrice = arc.price_finish_lacquer ?? 0
  else if (config.finish === 'schellack') finishPrice = arc.price_finish_shellac ?? 0

  let lightPrice = 0
  if (config.light === 'porzellan') lightPrice = arc.price_light_porcelain ?? 0
  else if (config.light === 'bg_led') lightPrice = arc.price_light_bg_led ?? 0
  else if (config.light === 'true_led') lightPrice = arc.price_light_true_led ?? 0

  const shippingPrice = SHIPPING_PRICES[shippingCountry]
  const subtotal = arc.base_price + sandingPrice + mountingPrice + finishPrice + lightPrice
  const total = subtotal + shippingPrice
  const deposit = Math.round(total * 0.3)
  const remaining = total - deposit

  return { sandingPrice, mountingPrice, finishPrice, lightPrice, shippingPrice, subtotal, total, deposit, remaining }
}
