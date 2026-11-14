/**
 * Shared safety guard for standalone database scripts.
 * Refuses execution unless process.env.SCRIPT_TARGET_URL is explicitly set
 * and strictly matches process.env.NEXT_PUBLIC_SUPABASE_URL.
 * Prints the target project hostname before proceeding.
 * Never prints or leaks credentials, tokens, or keys.
 */
export function assertScriptTarget(
  targetUrl: string | undefined = process.env.SCRIPT_TARGET_URL,
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
): string {
  const target = targetUrl?.trim()
  const current = supabaseUrl?.trim()

  if (!target) {
    throw new Error(
      'Safety check failed: SCRIPT_TARGET_URL is not set. ' +
        'Set SCRIPT_TARGET_URL to match NEXT_PUBLIC_SUPABASE_URL to confirm target database.'
    )
  }

  if (!current) {
    throw new Error(
      'Safety check failed: NEXT_PUBLIC_SUPABASE_URL is not set in environment.'
    )
  }

  if (target !== current) {
    let targetHost = target
    let currentHost = current
    try {
      targetHost = new URL(target).hostname
    } catch {}
    try {
      currentHost = new URL(current).hostname
    } catch {}

    throw new Error(
      `Safety check failed: SCRIPT_TARGET_URL (${targetHost}) does not match ` +
        `NEXT_PUBLIC_SUPABASE_URL (${currentHost}). Execution aborted.`
    )
  }

  let hostname: string
  try {
    hostname = new URL(current).hostname
  } catch {
    hostname = current
  }

  console.log(`[script guard] Target project hostname: ${hostname}`)
  return hostname
}
