import { createClient } from '@/lib/supabase/server'

interface LooseSupabase {
  rpc(fn: string, args?: unknown): Promise<{ data: unknown; error: { message: string } | null }>
}

/**
 * TypeScript wrapper that calls the Postgres generate_order_number() SQL function.
 */
export async function generateOrderNumber(): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await (supabase as unknown as LooseSupabase).rpc('generate_order_number')

  if (error) {
    console.error('Failed to generate order number:', error)
    throw new Error('Failed to generate order number: ' + error.message)
  }

  return data as string;
}
