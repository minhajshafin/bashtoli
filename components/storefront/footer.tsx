'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] tracking-[0.2em] uppercase text-gold-400 font-semibold mb-5 font-sans">
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
      <ul className="space-y-3.5">
        {links.map(({ label, href, external }) => (
          <li key={label}>
            {external || href.startsWith('http') ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-light text-forest-300 hover:text-gold-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-sm"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                className="text-xs sm:text-sm font-light text-forest-300 hover:text-cream-100 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-sm"
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
  const [currentYear, setCurrentYear] = useState<number>(2026)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  // Do not render footer on checkout page
  if (pathname === '/checkout' || pathname?.startsWith('/checkout/')) {
    return null
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative border-t border-forest-800/80 bg-forest-950 bg-laid-paper-dark text-cream-100 overflow-hidden" id="contact">
      {/* Minimalist Drifting Sumi-e Leaf */}
      <DriftingBambooLeaf theme="dark" className="left-1/3 bottom-4 hidden sm:block opacity-60" rotation={14} scale={0.9} />

      <div className="relative z-10 mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 pt-12 pb-8 md:pt-14 md:pb-8">
        {/* Mobile Brand Header */}
        <div className="md:hidden flex items-center gap-4 mb-8 pb-6 border-b border-forest-800/60">
          <Link
            href="/"
            className="inline-block rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400/60 shrink-0"
            aria-label="Bashtoli Home"
          >
            <Image
              src="/logo-round.svg"
              alt="Bashtoli Stationery"
              width={64}
              height={64}
              loading="lazy"
              className="h-16 w-16 object-contain"
            />
          </Link>
          <div>
            <span className="font-display text-lg font-medium text-cream-100 block">
              Bashtoli Stationery
            </span>
            <span className="text-[11px] uppercase tracking-wider text-gold-400 font-sans block mt-0.5">
              Dhaka · Est. 2026
            </span>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 sm:gap-x-10 gap-y-10 md:gap-y-12">
          {/* Brand Logo & Shop Bio (Desktop only) */}
          <div className="hidden md:flex md:col-span-3 flex-col items-start text-left max-w-[28ch]">
            <Link
              href="/"
              className="relative inline-block mb-5 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-full"
              aria-label="Bashtoli Home"
            >
              <Image
                src="/logo-round.svg"
                alt="Bashtoli Stationery"
                width={88}
                height={88}
                loading="lazy"
                className="h-20 w-20 lg:h-22 lg:w-22 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-xs font-light text-forest-300 leading-relaxed">
              Curated everyday stationery, artisanal paper goods, and timeless desk companions woven for thoughtful writers.
            </p>
            <p className="text-[10px] tracking-widest uppercase text-gold-400 font-semibold mt-4">
              Dhaka, Bangladesh · Est. 2026
            </p>
          </div>

          {/* Info Column */}
          <div className="col-span-1 md:col-span-2">
            <FooterColumn
              title="Collection"
              links={[
                { label: 'All Products', href: '/products' },
                { label: 'Our Story', href: '/#aboutus' },
                { label: 'Track My Order', href: '/order/lookup' },
                { label: 'Shopping Bag', href: '/bag' },
              ]}
            />
          </div>

          {/* Customer Care Column */}
          <div className="col-span-1 md:col-span-3">
            <ColumnHeading>Visit &amp; Contact</ColumnHeading>
            <address className="not-italic">
              <p className="text-xs sm:text-[0.92rem] font-light text-forest-300 leading-relaxed">
                Shajadpur, Bashtola
                <br />
                Gulshan-1212, Dhaka
              </p>
              <p className="text-xs text-forest-400 mt-2">Open 7 days · 7am – 11pm</p>
              <div className="mt-2.5 space-y-1">
                <a
                  href="tel:01320903666"
                  className="text-xs sm:text-sm text-gold-400 hover:text-gold-300 transition-colors duration-200 block font-price font-medium"
                >
                  01320-903666
                </a>
                <a
                  href="mailto:bashtoli.computer@gmail.com"
                  className="text-[11px] sm:text-xs text-gold-400 hover:text-gold-300 transition-colors duration-200 block truncate"
                >
                  bashtoli.computer@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
                {socials.map(({ label, href, color, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-forest-800 ${color} transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400/60`}
                  >
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      {icon}
                    </svg>
                  </a>
                ))}
              </div>
            </address>
          </div>

          {/* Location / Boutique Showcase Column */}
          <div className="col-span-2 md:col-span-4">
            <ColumnHeading>Our Location</ColumnHeading>
            <div className="rounded-2xl overflow-hidden border border-forest-800 bg-forest-900 shadow-md">
              <iframe
                title="Bashtoli Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d852.1068079492925!2d90.42298250636408!3d23.79462584364245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c78c486ded25%3A0x63964f79a60c5a7!2z4Kas4Ka-4KaB4Ka24Kak4Kay4KeAIOCmleCmruCnjeCmquCmv-CmieCmn-CmvuCmsCAtIEJhc2h0b2xpIENvbXB1dGVy!5e0!3m2!1sen!2sbd!4v1788283104370!5m2!1sen!2sbd"
                width="100%"
                height="160"
                style={{ border: 0, display: 'block', filter: 'brightness(0.9) contrast(1.05)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Bashtoli+Computer+Shajadpur+Dhaka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] tracking-wider uppercase text-forest-400 mt-2.5 inline-flex items-center gap-1.5 hover:text-gold-400 transition-colors duration-200"
            >
              <span>Get Directions</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 pb-2 border-t border-forest-800/80 flex flex-col-reverse md:flex-row items-center justify-between gap-6 mt-10 md:mt-12">
          <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-3 text-center sm:text-left">
            <p className="text-xs font-light text-forest-400">
              &copy; {currentYear} Bashtoli Stationery. Handcrafted in Dhaka.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="text-xs text-forest-400 hover:text-gold-400 transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-forest-400 hover:text-gold-400 transition-colors duration-200">
                Terms
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-3 text-xs tracking-wider uppercase text-forest-400 hover:text-gold-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-full cursor-pointer"
          >
            <span>Back to top</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-forest-800 group-hover:border-gold-400/60 group-hover:-translate-y-0.5 transition-all duration-200">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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