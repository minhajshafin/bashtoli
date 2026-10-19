'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-gold-400 font-semibold mb-3.5 font-sans">
      {children}
    </h4>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div>
      <ColumnHeading>{title}</ColumnHeading>
      <ul className="space-y-2.5">
        {links.map(({ label, href, external }) => (
          <li key={label}>
            {external || href.startsWith('http') ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-light text-text-inverse-secondary hover:text-text-accent transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-xs"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="text-xs font-light text-text-inverse-secondary hover:text-text-accent transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-xs"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const socials = [
  {
    label: 'WhatsApp',
    href: 'https://wa.me/8801825414737',
    color: 'text-emerald-400 hover:text-emerald-300 hover:border-emerald-400/60',
    icon: (
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.566 0 10.1-4.507 10.103-10.03.001-2.675-1.03-5.188-2.906-7.07C16.59 1.63 14.09 1.05 11.989 1.05 6.42 1.05 1.884 5.558 1.88 11.082c-.001 1.558.423 3.082 1.23 4.426l-1.036 3.79 3.973-1.044h.01zm11.367-6.52c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/bashtoli',
    color: 'text-forest-300 hover:text-gold-400 hover:border-gold-400/60',
    icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3.2l.8-4h-4V7a1 1 0 011-1h3z" />,
  },
]

export function Footer() {
  const pathname = usePathname()
  const currentYear = 2026

  // Do not render footer on checkout page
  if (pathname === '/checkout' || pathname?.startsWith('/checkout/')) {
    return null
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      className={`relative border-t border-forest-800/80 bg-forest-950 bg-laid-paper-dark text-cream-100 overflow-hidden ${
        pathname === '/' ? 'block' : 'hidden md:block'
      }`}
      id="contact"
    >
      {/* Minimalist Drifting Sumi-e Leaf Motif */}
      <DriftingBambooLeaf
        theme="dark"
        className="left-1/4 bottom-4 hidden sm:block opacity-45 pointer-events-none"
        rotation={14}
        scale={0.8}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-20 sm:pt-11 sm:pb-7">
        {/* Main Architectural Colophon Grid (Desktop multi-column, Mobile centered compact) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Col 1: Brand & Stationery Identity (Desktop & Mobile) */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Link
              href="/"
              className="flex flex-col items-center md:items-start gap-2 sm:gap-3 mb-2 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-xl"
              aria-label="Bashtoli Home"
            >
              <Image
                src="/logo-round.svg"
                alt="Bashtoli Stationery"
                width={88}
                height={88}
                loading="lazy"
                className="h-12 w-12 sm:h-20 sm:w-20 lg:h-22 lg:w-22 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
              />
              <div className="flex items-baseline justify-center md:justify-start gap-1.5 sm:gap-2 whitespace-nowrap">
                <span className="font-display text-sm sm:text-base lg:text-lg font-medium text-cream-100 leading-tight">
                  Bashtoli Stationery
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gold-400 font-sans">
                  &middot; Dhaka &middot; Est. 2026
                </span>
              </div>
            </Link>

            {/* Social Icons Row */}
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1 sm:mt-2">
              {socials.map(({ label, href, color, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`inline-flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-full border border-forest-800 bg-forest-900/60 ${color} hover:bg-forest-800/80 active:scale-95 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60`}
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    {icon}
                  </svg>
                </a>
              ))}
            </div>

            {/* Mobile Only: Minimal Inline Navigation Links */}
            <div className="md:hidden flex items-center justify-center gap-3 text-[11px] text-forest-300 font-light mt-4 pt-3.5 border-t border-forest-800/60 w-full max-w-xs">
              <Link href="/order/lookup" className="hover:text-text-accent transition-colors">
                Track Order
              </Link>
              <span className="text-forest-700">&middot;</span>
              <Link href="/privacy" className="hover:text-text-accent transition-colors">
                Privacy
              </Link>
              <span className="text-forest-700">&middot;</span>
              <Link href="/terms" className="hover:text-text-accent transition-colors">
                Terms
              </Link>
            </div>
          </div>

          {/* Col 2: Collection Navigation (Desktop only) */}
          <div className="hidden md:block col-span-1 md:col-span-2">
            <FooterColumn
              title="Collection"
              links={[
                { label: 'All Products', href: '/products' },
                { label: 'Curated Essentials', href: '/products?sort=featured' },
                { label: 'Our Story', href: '/#aboutus' },
                { label: 'Customer Requests', href: '/#suggest' },
              ]}
            />
          </div>

          {/* Col 3: Customer Care & Services (Desktop only) */}
          <div className="hidden md:block col-span-1 md:col-span-2">
            <FooterColumn
              title="Customer Care"
              links={[
                { label: 'Track My Order', href: '/order/lookup' },
                { label: 'Shopping Bag', href: '/bag' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ]}
            />
          </div>

          {/* Col 4: Shop Location & Visit Card (Desktop only) */}
          <div className="hidden md:block col-span-2 md:col-span-4">
            <ColumnHeading>Visit Our Shop</ColumnHeading>

            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/50 p-4 space-y-3">
              <div>
                <p className="text-xs text-cream-100 font-medium">
                  Shajadpur, Bashtola
                </p>
                <p className="text-xs text-forest-300 font-light mt-0.5">
                  Gulshan-1212, Dhaka, Bangladesh
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-forest-800/70 text-xs">
                <span className="text-forest-400 text-[11px]">Open 7 days &middot; 7am &ndash; 11pm</span>
                <a
                  href="tel:01320903666"
                  className="text-text-accent hover:text-text-accent-hover font-price font-medium text-xs transition-colors"
                >
                  01320-903666
                </a>
              </div>

              <div className="pt-1">
                <a
                  href="https://maps.google.com/?q=Bashtoli+Computer+Shajadpur+Dhaka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold text-text-accent hover:text-text-accent-hover transition-colors uppercase tracking-wider"
                >
                  <span>Open in Google Maps</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Colophon Bottom Bar */}
        <div className="pt-3.5 sm:pt-6 border-t border-forest-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-9 text-[10px] sm:text-[11px] font-light text-forest-400 text-center sm:text-left">
          <p>
            &copy; {currentYear} Bashtoli Stationery. Handcrafted in Dhaka.
          </p>

          <div className="hidden sm:flex items-center gap-4">
            <Link href="/privacy" className="hover:text-text-accent transition-colors duration-200">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text-accent transition-colors duration-200">
              Terms
            </Link>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="hidden sm:inline-flex group items-center gap-2 hover:text-text-accent transition-colors duration-200 cursor-pointer active:scale-95"
          >
            <span>Back to top</span>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-forest-800 group-hover:border-gold-400/60 group-hover:bg-forest-800/60 transition-colors">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="6 11 12 5 18 11" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}