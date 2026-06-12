/** #3 Interne Benachrichtigung an das Atelier bei einer neuen Produkt-Anfrage (PROJ-9). */
import { Hr, Section, Text } from '@react-email/components'
import { Eyebrow, EmailLayout, Heading, InfoRow, Paragraph, colors } from './_layout'

export interface InquiryAtelierProps {
  productName: string
  name: string
  email: string
  phone?: string | null
  message: string
  dateFormatted: string
}

export function InquiryAtelierEmail({
  productName,
  name,
  email,
  phone,
  message,
  dateFormatted,
}: InquiryAtelierProps) {
  return (
    <EmailLayout preview={`Neue Anfrage: ${productName}`}>
      <Eyebrow>Neue Anfrage</Eyebrow>
      <Heading>{productName}</Heading>
      <Paragraph>Eingegangen am {dateFormatted}.</Paragraph>

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Kontakt</Eyebrow>
      <InfoRow label="Name" value={name} />
      <InfoRow label="E-Mail" value={email} />
      {phone && <InfoRow label="Telefon" value={phone} />}

      <Hr style={{ borderColor: colors.border, margin: '28px 0' }} />

      <Eyebrow>Nachricht</Eyebrow>
      <Section
        style={{
          backgroundColor: colors.panel,
          borderRadius: '4px',
          padding: '16px 20px',
        }}
      >
        <Text
          style={{
            fontSize: '14px',
            lineHeight: '22px',
            color: colors.text,
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default InquiryAtelierEmail
