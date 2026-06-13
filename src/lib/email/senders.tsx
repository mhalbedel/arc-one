import 'server-only'
import { formatPrice } from '@/lib/utils'
import type { Address, Arc, Order, OrderItem } from '@/types'
import { sendEmail } from './client'
import { ATELIER_INBOX, ORDER_INBOX } from './config'
import {
  DepositConfirmationEmail,
  InquiryAtelierEmail,
  InquiryReceiptEmail,
  OrderFulfillmentEmail,
  type OrderFulfillmentItem,
  ShopPurchaseConfirmationEmail,
} from './templates'

export interface EmailCustomer {
  email: string
  name?: string | null
  address?: Address | null
}

function formatDate(date = new Date()): string {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(date)
}

function configFromOrder(order: Order) {
  const c = (order.config ?? {}) as Record<string, string | null>
  return {
    oberflaeche: c.sandingChoice ?? null,
    befestigung: c.mounting ?? null,
    finish: c.finish ?? null,
    licht: c.light ?? null,
  }
}

/** #5 — detaillierte Auftragsmail an die Auftragsabwicklung (auftrag@). */
async function sendOrderFulfillment(
  order: Order,
  typeLabel: 'Pre-Order' | 'Shop-Kauf',
  items: OrderFulfillmentItem[],
  customer: EmailCustomer,
) {
  await sendEmail({
    to: ORDER_INBOX,
    subject: `Neuer Auftrag ${order.order_number} (${typeLabel})`,
    react: (
      <OrderFulfillmentEmail
        orderNumber={order.order_number}
        typeLabel={typeLabel}
        dateFormatted={formatDate()}
        items={items}
        shippingCountry={customer.address?.country ?? null}
        shippingFormatted={formatPrice(order.shipping_price)}
        totalFormatted={formatPrice(order.total_price)}
        customerName={customer.name}
        customerEmail={customer.email}
        address={customer.address}
      />
    ),
  })
}

/** Detailzeilen einer Arc-Position fuer die Auftragsmail (Maße + Konfiguration). */
function arcDetailRows(arc: Arc, order: Order): OrderFulfillmentItem['details'] {
  const c = configFromOrder(order)
  const rows: { label: string; value: string }[] = [
    { label: 'Maße', value: `${arc.width_cm} × ${arc.height_cm} cm` },
  ]
  if (c.oberflaeche) rows.push({ label: 'Oberflaeche', value: c.oberflaeche })
  if (c.befestigung) rows.push({ label: 'Befestigung', value: c.befestigung })
  if (c.finish) rows.push({ label: 'Finish', value: c.finish })
  if (c.licht) rows.push({ label: 'Licht', value: c.licht })
  return rows
}

/** #1 Anzahlungsbestaetigung (Kunde) + #5 Auftragsmail — fuer eine abgeschlossene Pre-Order. */
export async function sendPreOrderEmails(order: Order, arc: Arc, customer: EmailCustomer) {
  await Promise.all([
    sendEmail({
      to: customer.email,
      subject: `Bestellung ${order.order_number} bestaetigt`,
      react: (
        <DepositConfirmationEmail
          orderNumber={order.order_number}
          customerName={customer.name}
          arcName={`Arc ${arc.serial_number}`}
          sizeText={`${arc.width_cm} × ${arc.height_cm} cm`}
          config={configFromOrder(order)}
          totalFormatted={formatPrice(order.total_price)}
          depositFormatted={formatPrice(order.deposit_amount)}
          remainingFormatted={formatPrice(order.remaining_amount)}
          address={customer.address}
        />
      ),
    }),
    sendOrderFulfillment(
      order,
      'Pre-Order',
      [
        {
          name: `Arc ${arc.serial_number}`,
          details: arcDetailRows(arc, order),
          priceFormatted: formatPrice(order.total_price - order.shipping_price),
        },
      ],
      customer,
    ),
  ])
}

/** #2 Kaufbestaetigung (Kunde) + #5 Atelier — fuer einen abgeschlossenen Shop-Kauf. */
export async function sendShopOrderEmails(
  order: Order,
  items: OrderItem[],
  customer: EmailCustomer,
) {
  await Promise.all([
    sendEmail({
      to: customer.email,
      subject: `Kaufbestaetigung ${order.order_number}`,
      react: (
        <ShopPurchaseConfirmationEmail
          orderNumber={order.order_number}
          customerName={customer.name}
          items={items.map((i) => ({
            name: i.name_snapshot,
            priceFormatted: formatPrice(i.price_cents),
          }))}
          totalFormatted={formatPrice(order.total_price)}
          address={customer.address}
        />
      ),
    }),
    sendOrderFulfillment(
      order,
      'Shop-Kauf',
      items.map((i) => ({
        name: i.name_snapshot,
        priceFormatted: formatPrice(i.price_cents),
      })),
      customer,
    ),
  ])
}

export interface InquiryEmailParams {
  productName: string
  name: string
  email: string
  phone?: string | null
  message: string
}

/** #3 Anfrage an Atelier + #4 Eingangsbestaetigung an den Kunden. */
export async function sendInquiryEmails({
  productName,
  name,
  email,
  phone,
  message,
}: InquiryEmailParams) {
  await Promise.all([
    sendEmail({
      to: ATELIER_INBOX,
      subject: `Neue Anfrage: ${productName}`,
      // Antworten landen direkt beim Interessenten.
      replyTo: email,
      react: (
        <InquiryAtelierEmail
          productName={productName}
          name={name}
          email={email}
          phone={phone}
          message={message}
          dateFormatted={formatDate()}
        />
      ),
    }),
    sendEmail({
      to: email,
      subject: 'Wir haben deine Anfrage erhalten',
      react: <InquiryReceiptEmail customerName={name} productName={productName} />,
    }),
  ])
}
