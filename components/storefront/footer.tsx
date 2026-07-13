'use client'

import React from 'react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 bg-white text-zinc-650 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="text-lg font-black tracking-tight text-zinc-900 dark:text-white hover:text-amber-600 transition-colors">
              Bashtoli
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500">
              Premium sustainable home decor and organic handicrafts hand-woven in Bangladesh. Bringing nature directly to your living spaces.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.566 0 10.1-4.507 10.103-10.03.001-2.675-1.03-5.188-2.906-7.07C16.59 1.63 14.09 1.05 11.989 1.05 6.42 1.05 1.884 5.558 1.88 11.082c-.001 1.558.423 3.082 1.23 4.426l-1.036 3.79 3.973-1.044h.01zm11.367-6.52c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Shop Collections
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/products" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  Catalog Browse
                </Link>
              </li>
              <li>
                <Link href="/cart?ref=footer" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Info Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Information
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/about" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  Our Artisans & Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  Contact Details
                </Link>
              </li>
              <li>
                <Link href="/order/lookup" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                  Track Guest Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Business Hours
            </h3>
            <div className="space-y-2 text-zinc-550 leading-relaxed font-semibold">
              <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
              <p>Sunday: Closed</p>
              <hr className="border-zinc-100 dark:border-zinc-900" />
              <p className="font-bold text-zinc-800 dark:text-zinc-300">Bashtoli Office</p>
              <p className="text-zinc-500 font-normal">House 45, Road 11, Banani, Dhaka</p>
              <p className="font-bold text-zinc-800 dark:text-zinc-300">Hotline: +880 1700-000000</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright segment */}
        <div className="mt-12 pt-8 border-t border-zinc-150 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-zinc-450 dark:text-zinc-500">
          <div>
            <p>&copy; {currentYear} Bashtoli. All rights reserved.</p>
            <p className="mt-0.5 text-[9px] text-zinc-400/70">Eco-Friendly Handcrafted Bamboo & Cane Decor</p>
          </div>
          <div className="flex gap-4">
            <span className="cursor-default">Dhaka, Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
