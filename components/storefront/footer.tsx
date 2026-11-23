import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'
import { BackToTopButton } from '@/components/storefront/back-to-top-button'

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-gold-400 font-semibold mb-3 sm:mb-3.5 font-sans">
      {children}
    </h3>
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
      <ul className="space-y-2 sm:space-y-2.5">
        {links.map(({ label, href, external }) => (
          <li key={label}>
            {external || href.startsWith('http') ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center text-xs font-light text-forest-300 hover:text-gold-200 transition-colors duration-200 py-0.5 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-xs"
              >
                <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">
                  {label}
                </span>
              </a>
            ) : (
              <Link
                href={href}
                prefetch={false}
                className="group/link inline-flex items-center text-xs font-light text-forest-300 hover:text-gold-200 transition-colors duration-200 py-0.5 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-xs"
              >
                <span className="transition-transform duration-200 group-hover/link:translate-x-0.5">
                  {label}
                </span>
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
    href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801825414737'}`,
    color: 'text-emerald-400 hover:text-emerald-300 border-forest-800 hover:border-emerald-500/50',
    icon: (
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.566 0 10.1-4.507 10.103-10.03.001-2.675-1.03-5.188-2.906-7.07C16.59 1.63 14.09 1.05 11.989 1.05 6.42 1.05 1.884 5.558 1.88 11.082c-.001 1.558.423 3.082 1.23 4.426l-1.036 3.79 3.973-1.044h.01zm11.367-6.52c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    ),
  },
  {
    label: 'Email',
    href: 'mailto:contact@bashtoli.com',
    color: 'text-gold-300 hover:text-gold-200 border-forest-800 hover:border-gold-400/50',
    icon: (
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/bashtoli',
    color: 'text-sky-300 hover:text-gold-300 border-forest-800 hover:border-sky-400/50',
    icon: (
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3.2l.8-4h-4V7a1 1 0 011-1h3z" />
    ),
  },
]

export function Footer() {
  const currentYear = 2026

  return (
    <footer
      className="relative border-t border-forest-800/80 bg-forest-950 bg-laid-paper-dark text-cream-100 overflow-hidden"
      id="contact"
    >
      {/* Minimalist Drifting Sumi-e Leaf Motif */}
      <DriftingBambooLeaf
        theme="dark"
        className="left-1/4 bottom-4 hidden sm:block opacity-45 pointer-events-none"
        rotation={14}
        scale={0.8}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] xl:max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 pt-8 pb-24 sm:pt-12 sm:pb-8">
        {/* Main Architectural Colophon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Col 1: Brand & Stationery Identity */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <Link
              href="/"
              className="inline-flex flex-col items-center md:items-start gap-2 sm:gap-2.5 mb-3 group focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60 rounded-xl"
              aria-label="Bashtoli Home"
            >
              <Image
                src="/logo-round.svg"
                alt="Bashtoli Stationery"
                width={80}
                height={80}
                loading="lazy"
                className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
              />
              <div className="flex flex-col items-center md:items-start">
                <span className="font-display text-base sm:text-lg font-medium text-cream-50 leading-tight">
                  Bashtoli Stationery
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-gold-400 font-sans mt-0.5">
                  Dhaka &middot; Est. 2026
                </span>
              </div>
            </Link>

            <p className="type-body-sm text-forest-300/90 font-light max-w-sm mb-4 text-pretty leading-relaxed">
              A quiet corner in Dhaka for anyone who finds joy in the tactile act of putting pen to paper.
            </p>

            {/* Social Icons Row */}
            <div className="flex items-center justify-center md:justify-start gap-2.5" role="group" aria-label="Social channels">
              {socials.map(({ label, href, color, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`inline-flex h-9 w-9 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl border bg-forest-900/60 ${color} hover:bg-forest-800/80 active:scale-95 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gold-400/60 shadow-xs`}
                >
                  <svg className="h-4 w-4 sm:h-3.5 sm:w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    {icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns (Col 2 & Col 3: Collection & Customer Care) */}
          <div className="col-span-1 md:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
            <FooterColumn
              title="Collection"
              links={[
                { label: 'All Products', href: '/products' },
                { label: 'Curated Essentials', href: '/products?sort=featured' },
                { label: 'Our Story', href: '/#aboutus' },
                { label: 'Customer Requests', href: '/#suggest' },
              ]}
            />

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

          {/* Col 4: Shop Location & Visit Card */}
          <div className="col-span-1 md:col-span-4">
            <ColumnHeading>Visit Our Shop</ColumnHeading>

            <div className="relative rounded-2xl border border-forest-800/90 bg-forest-900/40 p-4 sm:p-5 backdrop-blur-xs space-y-3 shadow-elevation-1 overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" aria-hidden="true" />

              <div className="flex items-start gap-2.5">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-forest-800/80 text-gold-400 border border-gold-500/20 mt-0.5" aria-hidden="true">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs sm:text-[13px] text-cream-100 font-medium">
                    Shajadpur, Bashtola
                  </p>
                  <p className="text-[11px] sm:text-xs text-forest-300 font-light mt-0.5">
                    Gulshan-1212, Dhaka, Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-forest-800/70 text-xs">
                <span className="text-forest-300 text-[11px]">
                  Open 7 days &middot; 7am &ndash; 11pm
                </span>
                <a
                  href="tel:01320903666"
                  className="inline-flex items-center gap-1 text-gold-300 hover:text-gold-200 font-price font-medium text-xs transition-colors py-0.5"
                >
                  <svg className="h-3 w-3 text-gold-400/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>01320-903666</span>
                </a>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <a
                  href="https://maps.google.com/?q=Bashtoli+Computer+Shajadpur+Dhaka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/map inline-flex items-center gap-1.5 font-sans font-semibold text-gold-300 hover:text-gold-200 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px] py-1"
                >
                  <span>Open in Google Maps</span>
                  <span className="transition-transform duration-200 group-hover/map:translate-x-0.5" aria-hidden="true">&rarr;</span>
                </a>
                <a
                  href="mailto:contact@bashtoli.com"
                  className="inline-flex items-center gap-1 font-sans font-medium text-forest-300 hover:text-gold-200 transition-colors py-1"
                >
                  <span>contact@bashtoli.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Colophon Bottom Bar */}
        <div className="pt-5 sm:pt-6 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-8 sm:mt-10 text-[11px] font-light text-forest-400 text-center sm:text-left">
          <p>
            &copy; {currentYear} Bashtoli Stationery. Handcrafted with care in Dhaka.
          </p>

          <BackToTopButton />
        </div>
      </div>
    </footer>
  )
}
