import { createClient } from '@/lib/supabase/server'
import { AddressesDashboard } from '@/components/storefront/addresses-dashboard'
import React from 'react'

export async function generateMetadata() {
  return {
    title: 'Saved Addresses | Bashtoli',
    description: 'Add, update, and manage default shipping and billing address records.',
  }
}

/**
 * Saved Addresses page.
 * Loads customer addresses server-side and renders the dashboard.
 */
export default async function AddressesPage() {
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
