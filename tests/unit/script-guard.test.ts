import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { assertScriptTarget, loadScriptEnv } from '../../scripts/_guard'

describe('scripts/_guard.ts: assertScriptTarget', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env = { ...originalEnv }
    delete process.env.SCRIPT_TARGET_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('throws error when SCRIPT_TARGET_URL is unset', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
    expect(() => assertScriptTarget()).toThrowError(
      /Safety check failed: SCRIPT_TARGET_URL is not set/
    )
  })

  it('throws error when SCRIPT_TARGET_URL is empty or whitespace', () => {
    process.env.SCRIPT_TARGET_URL = '   '
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
    expect(() => assertScriptTarget()).toThrowError(
      /Safety check failed: SCRIPT_TARGET_URL is not set/
    )
  })

  it('throws error when NEXT_PUBLIC_SUPABASE_URL is unset', () => {
    process.env.SCRIPT_TARGET_URL = 'https://test-project.supabase.co'
    expect(() => assertScriptTarget()).toThrowError(
      /Safety check failed: NEXT_PUBLIC_SUPABASE_URL is not set/
    )
  })

  it('throws error when SCRIPT_TARGET_URL does not match NEXT_PUBLIC_SUPABASE_URL', () => {
    process.env.SCRIPT_TARGET_URL = 'https://staging-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://production-project.supabase.co'

    expect(() => assertScriptTarget()).toThrowError(
      /Safety check failed: SCRIPT_TARGET_URL \(staging-project\.supabase\.co\) does not match NEXT_PUBLIC_SUPABASE_URL \(production-project\.supabase\.co\)/
    )
  })

  it('succeeds and prints the project hostname when URLs match', () => {
    const targetUrl = 'https://xyz-staging.supabase.co'
    process.env.SCRIPT_TARGET_URL = targetUrl
    process.env.NEXT_PUBLIC_SUPABASE_URL = targetUrl

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = assertScriptTarget()

    expect(result).toBe('xyz-staging.supabase.co')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(
      '[script guard] Target project hostname: xyz-staging.supabase.co'
    )
  })

  it('never logs or leaks secret keys or tokens', () => {
    const targetUrl = 'https://xyz-staging.supabase.co'
    process.env.SCRIPT_TARGET_URL = targetUrl
    process.env.NEXT_PUBLIC_SUPABASE_URL = targetUrl
    process.env.SUPABASE_SECRET_KEY = 'sb_secret_super_confidential_test_key'

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    assertScriptTarget()

    const logged = logSpy.mock.calls.flat().join(' ')
    expect(logged).not.toContain('secret')
    expect(logged).not.toContain('sb_secret_')
    expect(logged).not.toContain('super_confidential')
  })

  it('supports explicit parameter overrides for testing', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const hostname = assertScriptTarget(
      'https://custom-target.supabase.co',
      'https://custom-target.supabase.co'
    )

    expect(hostname).toBe('custom-target.supabase.co')
    expect(logSpy).toHaveBeenCalledWith(
      '[script guard] Target project hostname: custom-target.supabase.co'
    )

    expect(() =>
      assertScriptTarget(
        'https://mismatch-target.supabase.co',
        'https://different-target.supabase.co'
      )
    ).toThrowError(/Safety check failed/)
  })

  it('loadScriptEnv skips execution in VITEST environment to prevent test interference', () => {
    expect(process.env.VITEST).toBeDefined()
    delete process.env.TEST_LOAD_ENV_VAR
    loadScriptEnv()
    expect(process.env.TEST_LOAD_ENV_VAR).toBeUndefined()
  })
})
