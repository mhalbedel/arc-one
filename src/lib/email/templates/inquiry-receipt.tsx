/** #4 Eingangsbestaetigung an den Kunden nach dem Absenden einer Anfrage (PROJ-9). */
import { Section } from '@react-email/components'
import { Eyebrow, EmailLayout, Heading, Panel, Paragraph } from './_layout'

export interface InquiryReceiptProps {
  customerName?: string | null
  productName: string
}

export function InquiryReceiptEmail({ customerName, productName }: InquiryReceiptProps) {
  return (
    <EmailLayout preview="Wir haben deine Anfrage erhalten">
      <Eyebrow>Anfrage erhalten</Eyebrow>
      <Heading>Danke fuer dein Interesse</Heading>
      <Paragraph>
        {customerName ? `Hallo ${customerName},` : 'Hallo,'} wir haben deine Anfrage zu{' '}
        <strong>{productName}</strong> erhalten.
      </Paragraph>
      <Paragraph>
        Jedes unserer Stuecke ist ein Unikat &mdash; wir melden uns persoenlich bei dir, um dich zu
        diesem Objekt zu beraten.
      </Paragraph>

      <Section style={{ marginTop: '12px' }}>
        <Panel title="Was passiert jetzt?">
          Wir sehen uns deine Anfrage an und antworten dir direkt auf diese E-Mail-Adresse.
        </Panel>
      </Section>
    </EmailLayout>
  )
}

export default InquiryReceiptEmail
