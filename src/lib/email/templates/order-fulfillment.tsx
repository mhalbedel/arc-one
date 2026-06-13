/**
 * Detaillierte Auftragsmail an die Auftragsabwicklung (auftrag@arc-one.de) bei jeder
 * neuen Bestellung (Pre-Order oder Shop). Enthaelt die bestellte Ware mit allen
 * Arc-/Produkt-Details, Lieferung (Versandland + Versandkosten) und Lieferadresse.
 * Loest die fruehere knappe interne Benachrichtigung (#5) ab.
 */
import { Hr, Section } from '@react-email/components'
import type { Address } from '@/types'
import {
  AddressBlock,
  Eyebrow,
  EmailLayout,
  Heading,
  InfoRow,
  Paragraph,
  colors,
} from './_layout'

export interface OrderFulfillmentItem {
  name: string
  /** Detailzeilen wie Maße oder Konfiguration (Label/Wert). */
  details?: { label: string; value: string }[]
  priceFormatted: string
}

export interface OrderFulfillmentProps {
  orderNumber: string
  typeLabel: 'Pre-Order' | 'Shop-Kauf'
  dateFormatted: string
  items: OrderFulfillmentItem[]
  shippingCountry?: string | null
  shippingFormatted: string
  totalFormatted: string
  customerName?: string | null
  customerEmail: string
  address?: Address | null
}

export function OrderFulfillmentEmail({
  orderNumber,
  typeLabel,
  dateFormatted,
  items,
  shippingCountry,
  shippingFormatted,
  totalFormatted,
  customerName,
  customerEmail,
  address,
}: OrderFulfillmentProps) {
  return (
    <EmailLayout preview={`Auftrag ${orderNumber}`}>
      <Eyebrow>Neuer Auftrag</Eyebrow>
      <Heading>{orderNumber}</Heading>
      <Paragraph>
        {typeLabel} &middot; eingegangen am {dateFormatted}.
      </Paragraph>

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Bestellte Ware</Eyebrow>
      {items.map((item, i) => (
        <Section key={i} style={{ marginBottom: i < items.length - 1 ? '16px' : '0' }}>
          <InfoRow label={item.name} value={item.priceFormatted} strong />
          {item.details?.map((d) => (
            <InfoRow key={d.label} label={d.label} value={d.value} />
          ))}
        </Section>
      ))}

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Lieferung</Eyebrow>
      {shippingCountry && <InfoRow label="Versandland" value={shippingCountry} />}
      <InfoRow label="Versandkosten" value={shippingFormatted} />
      <InfoRow label="Gesamtbetrag" value={totalFormatted} strong />

      {address && (
        <>
          <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />
          <Eyebrow>Lieferadresse</Eyebrow>
          {customerName && <Paragraph>{customerName}</Paragraph>}
          <AddressBlock address={address} />
        </>
      )}

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Kunde</Eyebrow>
      {customerName && <InfoRow label="Name" value={customerName} />}
      <InfoRow label="E-Mail" value={customerEmail} />
    </EmailLayout>
  )
}

export default OrderFulfillmentEmail
