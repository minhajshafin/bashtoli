import { describe, it, expect } from 'vitest'
import { safeRedirectPath } from '@/lib/utils/safe-redirect'

describe('safeRedirectPath', () => {
  it('accepts valid relative paths', () => {
    expect(safeRedirectPath('/ok?x=1')).toBe('/ok?x=1')
    expect(safeRedirectPath('/products')).toBe('/products')
    expect(safeRedirectPath('/account/orders')).toBe('/account/orders')
    expect(safeRedirectPath('/')).toBe('/')
  })

  it('rejects protocol-relative, scheme-relative, and host-leading bypasses', () => {
    expect(safeRedirectPath('//host')).toBe('/')
    expect(safeRedirectPath('//evil.com')).toBe('/')
    expect(safeRedirectPath('//attacker.com/account')).toBe('/')
    expect(safeRedirectPath('/\\evil.com')).toBe('/')
    expect(safeRedirectPath('//')).toBe('/')
    expect(safeRedirectPath('/\\')).toBe('/')
  })

  it('rejects backslash variants', () => {
    expect(safeRedirectPath('\\host')).toBe('/')
    expect(safeRedirectPath('/\\host')).toBe('/')
    expect(safeRedirectPath('\\\\host')).toBe('/')
    expect(safeRedirectPath('/\\//host')).toBe('/')
    expect(safeRedirectPath('\\evil.com')).toBe('/')
  })

  it('rejects URL-encoded backslash and slash bypasses', () => {
    expect(safeRedirectPath('/%5Chost')).toBe('/')
    expect(safeRedirectPath('/%5cevil.com')).toBe('/')
    expect(safeRedirectPath('/%2fevil.com')).toBe('/')
    expect(safeRedirectPath('/%2FEvil.com')).toBe('/')
    expect(safeRedirectPath('/%2F%2Fhost')).toBe('/')
    expect(safeRedirectPath('/%5C%5Chost')).toBe('/')
    expect(safeRedirectPath('/%252f%252fhost')).toBe('/')
  })

  it('rejects absolute URLs with scheme', () => {
    expect(safeRedirectPath('https://host')).toBe('/')
    expect(safeRedirectPath('https://evil.com')).toBe('/')
    expect(safeRedirectPath('http://host')).toBe('/')
    expect(safeRedirectPath('http://evil.com')).toBe('/')
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/')
    expect(safeRedirectPath('data:text/html,<h1>attack</h1>')).toBe('/')
  })

  it('allows only same-origin relative paths', () => {
    expect(safeRedirectPath('/products')).toBe('/products')
    expect(safeRedirectPath('/account')).toBe('/account')
    expect(safeRedirectPath('/checkout')).toBe('/checkout')
    expect(safeRedirectPath('/order/lookup?ref=123')).toBe('/order/lookup?ref=123')
    expect(safeRedirectPath('/account/orders/123')).toBe('/account/orders/123')
  })

  it('rejects newline, carriage return, tabs, and all control character bypasses', () => {
    expect(safeRedirectPath('/foo\r\nSet-Cookie:bad')).toBe('/')
    expect(safeRedirectPath('/foo\nbar')).toBe('/')
    expect(safeRedirectPath('/foo\rbar')).toBe('/')
    expect(safeRedirectPath('/\\t/evil.com')).toBe('/')
    expect(safeRedirectPath('/%09/evil.com')).toBe('/')
    expect(safeRedirectPath('/%0a/evil.com')).toBe('/')
    expect(safeRedirectPath('/%0d%0a/evil.com')).toBe('/')
    expect(safeRedirectPath('/%00//evil.com')).toBe('/')
    expect(safeRedirectPath('/\x00//evil.com')).toBe('/')
    expect(safeRedirectPath('/\x1f/test')).toBe('/')
    expect(safeRedirectPath('/\x7f/test')).toBe('/')
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
