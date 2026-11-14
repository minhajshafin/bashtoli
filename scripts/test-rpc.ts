import { createClient } from '@supabase/supabase-js'
import { assertScriptTarget } from './_guard'

async function check() {
  assertScriptTarget()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SECRET_KEY!
  const supabase = createClient(url, key)
  
  const { data, error } = await supabase.rpc('generate_order_number')
  console.log('RPC result:', { data, error })
}

check().catch(console.error)
