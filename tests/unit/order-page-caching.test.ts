import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { resolveOrderAccess } from '@/lib/order/access'

describe('OrderConfirmationPage dynamic request guarantees and caching safety', () => {
  const filePath = path.resolve(process.cwd(), 'app/(storefront)/order/[orderNumber]/page.tsx')
  const content = fs.readFileSync(filePath, 'utf8')

  it('imports connection from next/server and awaits it at the top of the page orchestrator', () => {
    expect(content).toContain("import { connection } from 'next/server'")
    const connectionIdx = content.indexOf('await connection()')
    const cookiesIdx = content.indexOf('await cookies()')
    const dbIdx = content.indexOf('createAdminClient()')

    expect(connectionIdx).toBeGreaterThan(0)
    expect(cookiesIdx).toBeGreaterThan(connectionIdx)
    expect(dbIdx).toBeGreaterThan(connectionIdx)
  })

  it('confirms no "use cache" or unstable_cache wraps order data in the order flow', () => {
    expect(content).not.toContain('"use cache"')
    expect(content).not.toContain("'use cache'")
    expect(content).not.toContain('unstable_cache')
  })

  it('declares no-index and no-follow robots metadata to prevent crawler caching', () => {
    expect(content).toContain("robots: { index: false, follow: false }")
  })

  it('returns completely different access content for requests with valid token vs invalid/missing token', () => {
    const mockOrder = {
      id: 'ord-123',
      order_number: 'ORD-20260909-0001',
      user_id: null,
      access_token: 'secret-token-xyz-12345',
    }

    // Request 1: Valid token -> resolves full access
    const accessReq1 = resolveOrderAccess({
      order: mockOrder,
      user: null,
      role: null,
      token: 'secret-token-xyz-12345',
      cookieVerified: false,
    })
    expect(accessReq1).toBe('full')

    // Request 2: Invalid/different token -> strictly blocked to gate view
    const accessReq2 = resolveOrderAccess({
      order: mockOrder,
      user: null,
      role: null,
      token: 'wrong-or-expired-token',
      cookieVerified: false,
    })
    expect(accessReq2).toBe('gate')

    // Request 3: Missing token -> strictly blocked to gate view
    const accessReq3 = resolveOrderAccess({
      order: mockOrder,
      user: null,
      role: null,
      token: undefined,
      cookieVerified: false,
    })
    expect(accessReq3).toBe('gate')
  })
})
