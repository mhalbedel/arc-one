import 'server-only'
import { formatPrice } from '@/lib/utils'
import type { Address, Arc, Order, OrderItem } from '@/types'
import { sendEmail } from './client'
import { ATELIER_INBOX } from './config'
import {
  DepositConfirmationEmail,
  InquiryAtelierEmail,
  InquiryReceiptEmail,
  NewOrderAtelierEmail,
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

/** #5 — interne Bestellbenachrichtigung an das Atelier. */
async function sendNewOrderNotification(
  order: Order,
  typeLabel: 'Pre-Order' | 'Shop-Kauf',
  customer: EmailCustomer,
) {
  await sendEmail({
    to: ATELIER_INBOX,
    subject: `Neue Bestellung ${order.order_number} (${typeLabel})`,
    react: (
      <NewOrderAtelierEmail
        orderNumber={order.order_number}
        typeLabel={typeLabel}
        totalFormatted={formatPrice(order.total_price)}
        customerName={customer.name}
        customerEmail={customer.email}
        dateFormatted={formatDate()}
      />
    ),
  })
}

/** #1 Anzahlungsbestaetigung (Kunde) + #5 Atelier — fuer eine abgeschlossene Pre-Order. */
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
    sendNewOrderNotification(order, 'Pre-Order', customer),
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
    sendNewOrderNotification(order, 'Shop-Kauf', customer),
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
