import React from 'react'
import { BagClient } from '@/components/storefront/bag-client'

export const metadata = {
  title: 'Shopping Bag | Bashtoli',
  description: 'Review your chosen stationery items in your shopping bag before checkout.',
  alternates: {
    canonical: 'https://bashtoli.com/bag',
  },
  openGraph: {
    title: 'Shopping Bag | Bashtoli',
    description: 'Review your chosen stationery items in your shopping bag before checkout.',
    url: 'https://bashtoli.com/bag',
    siteName: 'Bashtoli',
    locale: 'en_US',
    type: 'website',
  },
}

export default function BagPage() {
  return <BagClient />
}
