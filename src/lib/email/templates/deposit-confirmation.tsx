/** #1 Anzahlungsbestaetigung an den Kunden nach erfolgreicher 30%-Zahlung (PROJ-4). */
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

export interface DepositConfirmationProps {
  orderNumber: string
  customerName?: string | null
  arcName: string
  sizeText: string
  config: {
    oberflaeche?: string | null
    befestigung?: string | null
    finish?: string | null
    licht?: string | null
  }
  totalFormatted: string
  depositFormatted: string
  remainingFormatted: string
  address?: Address | null
}

export function DepositConfirmationEmail({
  orderNumber,
  customerName,
  arcName,
  sizeText,
  config,
  totalFormatted,
  depositFormatted,
  remainingFormatted,
  address,
}: DepositConfirmationProps) {
  const hasConfig = config.oberflaeche || config.befestigung || config.finish || config.licht
  return (
    <EmailLayout preview={`Bestellung ${orderNumber} bestaetigt`}>
      <Eyebrow>Bestellung bestaetigt</Eyebrow>
      <Heading>Bestellnummer {orderNumber}</Heading>
      <Paragraph>
        {customerName ? `Hallo ${customerName},` : 'Hallo,'} vielen Dank fuer deine Bestellung. Wir
        haben deine Anzahlung erhalten und dein Arc ist fuer dich reserviert.
      </Paragraph>

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Dein Arc</Eyebrow>
      <Paragraph>
        <strong>{arcName}</strong>
        <br />
        {sizeText}
      </Paragraph>

      {hasConfig && (
        <Section>
          <Eyebrow>Konfiguration</Eyebrow>
          {config.oberflaeche && <InfoRow label="Oberflaeche" value={config.oberflaeche} />}
          {config.befestigung && <InfoRow label="Befestigung" value={config.befestigung} />}
          {config.finish && <InfoRow label="Finish" value={config.finish} />}
          {config.licht && <InfoRow label="Licht" value={config.licht} />}
        </Section>
      )}

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Zahlung</Eyebrow>
      <InfoRow label="Gesamtpreis" value={totalFormatted} />
      <InfoRow label="Bezahlt (30% Anzahlung)" value={depositFormatted} strong />
      <InfoRow label="Ausstehend (vor Versand)" value={remainingFormatted} />

      {address && (
        <>
          <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />
          <Eyebrow>Lieferadresse</Eyebrow>
          <AddressBlock address={address} />
        </>
      )}

      <Section style={{ marginTop: '24px' }}>
        <Panel title="Wie geht es weiter?">
          Wir melden uns innerhalb von 2&ndash;3 Werktagen mit einer Auftragsbestaetigung und dem
          geplanten Produktionszeitraum. Den Restbetrag ({remainingFormatted}) zahlst du vor dem
          Versand.
        </Panel>
      </Section>
    </EmailLayout>
  )
}

export default DepositConfirmationEmail
