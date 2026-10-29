import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/supabase/require-user'
import { fetchCustomerOrders } from '@/lib/queries/customer-orders'
import {
  Package,
  MapPin,
  Heart,
  User,
  ArrowRight,
  Clock,
  ChevronRight,
} from 'lucide-react'

export async function generateMetadata() {
  return {
    title: 'Account Overview',
    description: 'Manage your Bashtoli orders, wishlist, and customer profile.',
  }
}

export const instant = false

export default async function AccountPage() {
  const user = await requireUser('/account')
  const supabase = await createClient()

  // Fetch profile, customer orders, and wishlist count in parallel
  const [{ data: profile }, orders, { count: wishlistCount }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    fetchCustomerOrders(),
    supabase.from('wishlist').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Customer'
  const recentOrders = orders.slice(0, 3)
  const totalOrdersCount = orders.length
  const totalWishlistCount = wishlistCount ?? 0

  const quickLinks = [
    {
      title: 'Order History',
      description: `${totalOrdersCount} ${totalOrdersCount === 1 ? 'order' : 'orders'} logged`,
      href: '/account/orders',
      icon: Package,
    },
    {
      title: 'Saved Addresses',
      description: 'Manage shipping book',
      href: '/account/addresses',
      icon: MapPin,
    },
    {
      title: 'My Wishlist',
      description: `${totalWishlistCount} ${totalWishlistCount === 1 ? 'item' : 'items'} saved`,
      href: '/account/wishlist',
      icon: Heart,
    },
    {
      title: 'Profile Settings',
      description: 'Security & contact info',
      href: '/account/profile',
      icon: User,
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="border-b border-forest-800/80 pb-5">
        <p className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-gold-400/90 mb-1">
          — ACCOUNT OVERVIEW · BASHTOLI STATIONERY
        </p>
        <h1 className="text-2xl sm:text-3xl font-medium text-cream-50 tracking-tight font-display">
          Welcome back, {displayName.split(' ')[0]}
        </h1>
        <p className="text-xs sm:text-[13px] text-forest-300 mt-1 font-sans leading-relaxed">
          Manage your stationery orders, delivery addresses, saved wishlist, and personal profile.
        </p>
      </div>

      {/* Quick Links Grid: 2-column tactile mobile cards in solid warm cream */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md text-forest-950 hover:border-gold-500/60 hover:shadow-lg active:scale-[0.98] transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-forest-950 text-gold-400 border border-forest-800 group-hover:bg-gold-500 group-hover:text-forest-950 transition-colors shrink-0 shadow-2xs">
                  <Icon className="h-5 w-5 stroke-[1.8]" />
                </div>
                <ChevronRight className="h-4 w-4 text-gold-600 group-hover:text-gold-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-3.5">
                <h3 className="text-xs sm:text-sm font-semibold text-forest-950 group-hover:text-gold-700 transition-colors font-sans truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-forest-600 font-sans mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-medium text-cream-50 font-display">
            Recent Orders
          </h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-xs font-sans font-semibold uppercase tracking-wider text-gold-400 hover:text-gold-300 transition-colors"
            >
              <span>View all ({orders.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const orderDateStr = new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md text-forest-950 hover:border-forest-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-forest-950 font-mono">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-forest-900 text-gold-400 border border-forest-800 font-sans">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-forest-600 font-sans flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-forest-400" />
                      <span>{orderDateStr}</span>
                      <span>·</span>
                      <span>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-forest-200/60">
                    <span className="text-base sm:text-lg font-bold text-forest-950 font-price">
                      ৳{order.total.toLocaleString()}
                    </span>
                    <Link
                      href={`/order/${order.order_number}`}
                      className="inline-flex h-9 items-center justify-center text-xs font-sans font-semibold px-4 rounded-xl bg-forest-900 text-cream-50 hover:bg-gold-500 hover:text-forest-950 active:scale-95 transition-all shadow-xs"
                    >
                      View Receipt
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-forest-200/90 bg-cream-50 shadow-md text-forest-950 p-8 sm:p-10 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-forest-950 text-gold-400 mb-2 border border-forest-800 shadow-2xs">
              <Package className="h-5 w-5 stroke-[1.75]" />
            </div>
            <p className="text-sm font-semibold text-forest-950 font-display">You haven&apos;t placed any orders yet.</p>
            <p className="text-xs text-forest-600 max-w-sm mx-auto font-sans">Discover our handcrafted notebooks, pens, and desk essentials.</p>
            <div className="pt-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider text-forest-900 hover:text-forest-950 transition-colors"
              >
                <span>Browse stationery collection</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
