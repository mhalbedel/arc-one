import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'

const sendMock = vi.fn()
vi.mock('server-only', () => ({}))
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

import { sendEmail } from './client'

const react = createElement('div')

beforeEach(() => {
  sendMock.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('sendEmail (best-effort, nicht-blockierend)', () => {
  it('gibt true zurueck, wenn Resend die Mail annimmt', async () => {
    sendMock.mockResolvedValue({ data: { id: 'x' }, error: null })
    expect(await sendEmail({ to: 'a@b.de', subject: 's', react })).toBe(true)
  })

  it('gibt false zurueck (ohne zu werfen), wenn Resend einen Fehler meldet', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } })
    await expect(sendEmail({ to: 'a@b.de', subject: 's', react })).resolves.toBe(false)
  })

  it('gibt false zurueck (ohne zu werfen), wenn der Versand eine Exception wirft', async () => {
    sendMock.mockRejectedValue(new Error('network down'))
    await expect(sendEmail({ to: 'a@b.de', subject: 's', react })).resolves.toBe(false)
  })

  it('nutzt die Marken-Absenderadresse und Standard-Reply-To', async () => {
    sendMock.mockResolvedValue({ error: null })
    await sendEmail({ to: 'a@b.de', subject: 's', react })
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'ARC ONE <bestellung@arc-one.de>',
        to: 'a@b.de',
        replyTo: 'kontakt@arc-one.de',
      }),
    )
  })

  it('erlaubt ein abweichendes Reply-To (z. B. Anfrage an Atelier)', async () => {
    sendMock.mockResolvedValue({ error: null })
    await sendEmail({ to: 'atelier@arc-one.de', subject: 's', react, replyTo: 'kunde@x.de' })
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ replyTo: 'kunde@x.de' }))
  })
})
