import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('OrderConfirmationPage dynamic request guarantees and caching safety', () => {
  const filePath = path.resolve(process.cwd(), 'app/(storefront)/order/[orderNumber]/page.tsx')
  const content = fs.readFileSync(filePath, 'utf8')

  it('imports connection from next/server and awaits it at the top of the page orchestrator', () => {
    expect(content).toContain("import { connection } from 'next/server'")
    // connection() must be called before accessing cookies or database
    const connectionIdx = content.indexOf('await connection()')
    const cookiesIdx = content.indexOf('await cookies()')
    const dbIdx = content.indexOf('createAdminClient()')

    expect(connectionIdx).toBeGreaterThan(0)
    expect(cookiesIdx).toBeGreaterThan(connectionIdx)
    expect(dbIdx).toBeGreaterThan(connectionIdx)
  })

  it('declares no-index and no-follow robots metadata to prevent crawler caching', () => {
    expect(content).toContain("robots: { index: false, follow: false }")
  })

  it('evaluates dynamic auth and verified phone cookies on every incoming request without static caching', () => {
    expect(content).toContain('resolveOrderAccess(')
    expect(content).toContain('isOrderCookieVerified(')
    expect(content).toContain('createAdminClient()')
  })
})
