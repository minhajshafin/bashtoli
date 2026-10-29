import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/supabase/require-user'
import { AddressesDashboard } from '@/components/storefront/addresses-dashboard'
import React from 'react'

export async function generateMetadata() {
  return {
    title: 'Saved Addresses',
    description: 'Add, update, and manage default shipping and billing address records.',
  }
}

export const instant = false

/**
 * Saved Addresses page.
 * Loads customer addresses server-side and renders the dashboard.
 */
export default async function AddressesPage() {
  await requireUser('/account/addresses')
  const supabase = await createClient()

  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user addresses:', error)
  }

  const savedAddresses = addresses || []

  return <AddressesDashboard initialAddresses={savedAddresses} />
}
