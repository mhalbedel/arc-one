/**
 * Gemeinsames Marken-Layout und Stil-Bausteine fuer alle ARC-ONE Transaktionsmails.
 * E-Mail-Clients ignorieren CSS-Variablen und externe Stylesheets, daher sind die
 * Markenfarben hier als feste Hex-Werte hinterlegt (abgeleitet aus globals.css:
 * background 36 33% 97%, foreground 30 35% 12%, accent/clay 17 50% 54%).
 */
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'
import type { Address } from '@/types'

export const colors = {
  page: '#F2ECE3',
  card: '#FAF7F2',
  text: '#29211A',
  muted: '#8A7259',
  clay: '#C4704F',
  panel: '#EFE9DF',
  border: '#E0D6C7',
} as const

const serif = "Georgia, 'Times New Roman', serif"
const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

const styles = {
  body: { backgroundColor: colors.page, margin: 0, padding: '32px 0', fontFamily: sans },
  container: {
    backgroundColor: colors.card,
    maxWidth: '560px',
    margin: '0 auto',
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
  },
  header: { padding: '32px 40px 24px', textAlign: 'center' as const },
  wordmark: {
    fontFamily: serif,
    fontSize: '20px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: colors.text,
    fontWeight: 500,
    margin: 0,
  },
  wordmarkBar: {
    width: '32px',
    height: '3px',
    backgroundColor: colors.clay,
    borderRadius: '2px',
    margin: '10px auto 0',
  },
  content: { padding: '8px 40px 40px' },
  footer: { padding: '24px 40px 32px', textAlign: 'center' as const },
  footerText: { fontSize: '12px', lineHeight: '18px', color: colors.muted, margin: 0 },
  hr: { borderColor: colors.border, margin: '28px 0' },
}

/** Aeussere Huelle inkl. Wortmarke und Footer. */
export function EmailLayout({
  preview,
  children,
}: {
  preview: string
  children: ReactNode
}) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.wordmark}>ARC&middot;ONE</Text>
            <div style={styles.wordmarkBar} />
          </Section>
          <Section style={styles.content}>{children}</Section>
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              ARC&middot;ONE &mdash; Handgefertigte Eukalyptus-Leuchten aus Monchique, Portugal
            </Text>
            <Text style={{ ...styles.footerText, marginTop: '6px' }}>
              Fragen? Antworte einfach auf diese E-Mail.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ── Wiederverwendbare Bausteine ────────────────────────────

const block = {
  eyebrow: {
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: colors.muted,
    margin: '0 0 10px',
  },
  h1: { fontFamily: serif, fontSize: '24px', color: colors.text, fontWeight: 500, margin: '0 0 8px' },
  paragraph: { fontSize: '14px', lineHeight: '22px', color: colors.text, margin: '0 0 16px' },
  rowLabel: { fontSize: '14px', color: colors.muted, margin: 0 },
  rowValue: { fontSize: '14px', color: colors.text, margin: 0, textAlign: 'right' as const },
  panel: { backgroundColor: colors.panel, borderRadius: '4px', padding: '16px 20px', margin: '8px 0 0' },
  panelTitle: { fontSize: '14px', fontWeight: 600, color: colors.text, margin: '0 0 4px' },
  panelText: { fontSize: '13px', lineHeight: '20px', color: colors.muted, margin: 0 },
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={block.eyebrow}>{children}</Text>
}

export function Heading({ children }: { children: ReactNode }) {
  return <Text style={block.h1}>{children}</Text>
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={block.paragraph}>{children}</Text>
}

/** Label-/Wert-Zeile (z. B. Preis-Aufschluesselung). `strong` hebt den Wert hervor. */
export function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '0 0 8px' }}>
      <tbody>
        <tr>
          <td style={{ width: '60%' }}>
            <Text style={block.rowLabel}>{label}</Text>
          </td>
          <td style={{ width: '40%' }}>
            <Text style={{ ...block.rowValue, fontWeight: strong ? 600 : 400 }}>{value}</Text>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

/** Hervorgehobener Hinweis-Kasten. */
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={block.panel}>
      <Text style={block.panelTitle}>{title}</Text>
      <Text style={block.panelText}>{children}</Text>
    </div>
  )
}

/** Lieferadresse als kompakter Block. */
export function AddressBlock({ address }: { address: Address }) {
  return (
    <Text style={{ ...block.paragraph, margin: 0 }}>
      {address.street}
      <br />
      {address.zip} {address.city}
      <br />
      {address.country}
    </Text>
  )
}

export { serif, sans }
