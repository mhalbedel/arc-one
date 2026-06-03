import { describe, it, expect, vi, afterEach } from 'vitest'
import { rateLimit, clientIp } from './rate-limit'

afterEach(() => {
  vi.useRealTimers()
})

describe('rateLimit', () => {
  it('allows requests up to the limit, then blocks', () => {
    const key = `test-${Math.random()}`
    expect(rateLimit(key, 3, 60_000)).toBe(true)
    expect(rateLimit(key, 3, 60_000)).toBe(true)
    expect(rateLimit(key, 3, 60_000)).toBe(true)
    expect(rateLimit(key, 3, 60_000)).toBe(false)
  })

  it('keeps separate counters per key', () => {
    const a = `a-${Math.random()}`
    const b = `b-${Math.random()}`
    expect(rateLimit(a, 1, 60_000)).toBe(true)
    expect(rateLimit(a, 1, 60_000)).toBe(false)
    // anderer Schlüssel bleibt unberührt
    expect(rateLimit(b, 1, 60_000)).toBe(true)
  })

  it('allows again once the window has elapsed', () => {
    vi.useFakeTimers()
    const key = `window-${Math.random()}`
    expect(rateLimit(key, 1, 10_000)).toBe(true)
    expect(rateLimit(key, 1, 10_000)).toBe(false)
    vi.advanceTimersByTime(10_001)
    expect(rateLimit(key, 1, 10_000)).toBe(true)
  })
})

describe('clientIp', () => {
  it('takes the first IP from x-forwarded-for', () => {
    const req = new Request('https://x.test', {
      headers: { 'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178' },
    })
    expect(clientIp(req)).toBe('203.0.113.7')
  })

  it('falls back to "unknown" without the header', () => {
    expect(clientIp(new Request('https://x.test'))).toBe('unknown')
  })
})
