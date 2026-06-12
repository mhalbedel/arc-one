/** #2 Kaufbestaetigung an den Kunden nach erfolgreichem Shop-Direktkauf (100%, PROJ-9). */
import { Hr, Section } from '@react-email/components'
import type { Address } from '@/types'
import {
  AddressBlock,
  Eyebrow,
  EmailLayout,
  Heading,
  InfoRow,
  Panel,
  Paragraph,
  colors,
} from './_layout'

export interface ShopPurchaseItem {
  name: string
  priceFormatted: string
}

export interface ShopPurchaseConfirmationProps {
  orderNumber: string
  customerName?: string | null
  items: ShopPurchaseItem[]
  totalFormatted: string
  address: Address
}

export function ShopPurchaseConfirmationEmail({
  orderNumber,
  customerName,
  items,
  totalFormatted,
  address,
}: ShopPurchaseConfirmationProps) {
  return (
    <EmailLayout preview={`Kaufbestaetigung ${orderNumber}`}>
      <Eyebrow>Kauf bestaetigt</Eyebrow>
      <Heading>Bestellnummer {orderNumber}</Heading>
      <Paragraph>
        {customerName ? `Hallo ${customerName},` : 'Hallo,'} vielen Dank fuer deinen Einkauf. Deine
        Zahlung ist eingegangen &mdash; jedes Stueck ist ein handgefertigtes Unikat und gehoert nun
        dir.
      </Paragraph>

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Deine Stuecke</Eyebrow>
      {items.map((item, i) => (
        <InfoRow key={i} label={item.name} value={item.priceFormatted} />
      ))}
      <Hr style={{ borderColor: colors.border, margin: '16px 0' }} />
      <InfoRow label="Gesamt (bezahlt)" value={totalFormatted} strong />

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Lieferadresse</Eyebrow>
      <AddressBlock address={address} />

      <Section style={{ marginTop: '24px' }}>
        <Panel title="Wie geht es weiter?">
          Wir bereiten deine Bestellung fuer den Versand vor und melden uns, sobald sie unterwegs
          ist.
        </Panel>
      </Section>
    </EmailLayout>
  )
}

export default ShopPurchaseConfirmationEmail
