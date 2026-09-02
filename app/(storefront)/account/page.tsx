import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchCustomerOrders } from '@/lib/queries/customer-orders'

export async function generateMetadata() {
  return {
    title: 'Account Overview | Bashtoli',
    description: 'Manage your Bashtoli orders, wishlist, and customer profile.',
  }
}

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/account')
  }

  // Fetch profile & customer orders
  const [{ data: profile }, orders] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    fetchCustomerOrders(),
  ])

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Customer'
  const recentOrders = orders.slice(0, 3)

  const quickLinks = [
    {
      title: 'Order History',
      href: '/account/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
        </svg>
      ),
    },
    {
      title: 'Saved Addresses',
      href: '/account/addresses',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      ),
    },
    {
      title: 'My Wishlist',
      href: '/account/wishlist',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      ),
    },
    {
      title: 'Profile Settings',
      href: '/account/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.964 0a9 9 0 1 0-11.963 0m11.964 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="border-b border-forest-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500 mb-1.5">
          Account Overview
        </p>
        <h1
          className="text-3xl sm:text-4xl text-forest-900 font-normal tracking-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
        >
          Welcome, {displayName}
        </h1>
        <p className="text-sm sm:text-base text-forest-600 mt-2 font-light">
          Manage your orders, saved addresses, wishlist, and profile information.
        </p>
      </div>

      {/* Reduced Minimal Buttons (No subtext) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-5 py-4 rounded-2xl border border-forest-200 bg-cream-100/70 hover:bg-cream-100 hover:border-gold-500/50 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-800 text-gold-400 group-hover:bg-gold-500 group-hover:text-forest-900 transition-colors shrink-0">
                {item.icon}
              </div>
              <span className="text-sm sm:text-base font-semibold text-forest-900 group-hover:text-gold-600 transition-colors">
                {item.title}
              </span>
            </div>
            <span className="text-forest-400 group-hover:text-gold-500 group-hover:translate-x-1 transition-all text-base font-bold">
              &rarr;
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl sm:text-2xl font-normal text-forest-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic' }}
          >
            Recent Orders
          </h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-sm font-semibold text-gold-600 hover:text-gold-500 transition-colors"
            >
              View all ({orders.length}) &rarr;
            </Link>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl border border-forest-200 bg-cream-100/70 hover:bg-cream-100 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-forest-900">
                      {order.order_number}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-forest-200 text-forest-800">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-forest-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    · {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-base sm:text-lg font-bold text-forest-900">
                    ৳{order.total.toLocaleString()}
                  </span>
                  <Link
                    href={`/order/${order.order_number}`}
                    className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full bg-forest-800 text-cream-100 hover:bg-gold-500 hover:text-forest-900 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-forest-200 bg-cream-100/40 p-8 text-center">
            <p className="text-sm text-forest-600">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-flex mt-3 text-sm font-bold text-gold-600 hover:text-gold-500 hover:underline"
            >
              Browse our stationery collection &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
