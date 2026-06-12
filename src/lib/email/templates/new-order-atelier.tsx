/** #5 Interne Benachrichtigung an das Atelier bei jeder neuen Bestellung (Pre-Order oder Shop). */
import { Hr } from '@react-email/components'
import { Eyebrow, EmailLayout, Heading, InfoRow, Paragraph, colors } from './_layout'

export interface NewOrderAtelierProps {
  orderNumber: string
  typeLabel: 'Pre-Order' | 'Shop-Kauf'
  totalFormatted: string
  customerName?: string | null
  customerEmail: string
  dateFormatted: string
}

export function NewOrderAtelierEmail({
  orderNumber,
  typeLabel,
  totalFormatted,
  customerName,
  customerEmail,
  dateFormatted,
}: NewOrderAtelierProps) {
  return (
    <EmailLayout preview={`Neue Bestellung ${orderNumber}`}>
      <Eyebrow>Neue Bestellung</Eyebrow>
      <Heading>{orderNumber}</Heading>
      <Paragraph>Eingegangen am {dateFormatted}.</Paragraph>

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <InfoRow label="Typ" value={typeLabel} />
      <InfoRow label="Betrag" value={totalFormatted} strong />
      {customerName && <InfoRow label="Kunde" value={customerName} />}
      <InfoRow label="E-Mail" value={customerEmail} />
    </EmailLayout>
  )
}

export default NewOrderAtelierEmail
