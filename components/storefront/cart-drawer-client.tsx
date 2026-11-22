'use client'

import dynamic from 'next/dynamic'

export const CartDrawer = dynamic(
  () => import('@/components/storefront/cart-drawer').then((m) => m.CartDrawer),
  { ssr: false }
)
