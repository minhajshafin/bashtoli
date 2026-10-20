import { describe, it, expect } from 'vitest'
import { safeRedirectPath } from '@/lib/utils/safe-redirect'

describe('safeRedirectPath', () => {
  it('accepts valid relative paths', () => {
    expect(safeRedirectPath('/ok?x=1')).toBe('/ok?x=1')
    expect(safeRedirectPath('/products')).toBe('/products')
    expect(safeRedirectPath('/account/orders')).toBe('/account/orders')
    expect(safeRedirectPath('/')).toBe('/')
  })

  it('rejects protocol-relative and scheme-relative URLs', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/')
    expect(safeRedirectPath('/\\evil.com')).toBe('/')
    expect(safeRedirectPath('//')).toBe('/')
    expect(safeRedirectPath('/\\')).toBe('/')
  })

  it('rejects URL-encoded backslash and slash bypasses', () => {
    expect(safeRedirectPath('/%5Cevil.com')).toBe('/')
    expect(safeRedirectPath('/%5cevil.com')).toBe('/')
    expect(safeRedirectPath('/%2fevil.com')).toBe('/')
    expect(safeRedirectPath('/%2FEvil.com')).toBe('/')
  })

  it('rejects absolute URLs with scheme', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/')
    expect(safeRedirectPath('http://evil.com')).toBe('/')
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/')
  })

  it('rejects newline and carriage return injection', () => {
    expect(safeRedirectPath('/foo\r\nSet-Cookie:bad')).toBe('/')
    expect(safeRedirectPath('/foo\nbar')).toBe('/')
    expect(safeRedirectPath('/foo\rbar')).toBe('/')
  })

  it('handles null, undefined, empty, or non-string inputs with default or custom fallback', () => {
    expect(safeRedirectPath(null)).toBe('/')
    expect(safeRedirectPath(undefined)).toBe('/')
    expect(safeRedirectPath('')).toBe('/')
    expect(safeRedirectPath(null, '/products')).toBe('/products')
    expect(safeRedirectPath('//evil.com', '/fallback')).toBe('/fallback')
  })

  it('rejects malformed URI sequences safely without throwing', () => {
    expect(safeRedirectPath('/%E0%A4%A')).toBe('/')
  })
})
