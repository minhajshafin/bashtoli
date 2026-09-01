'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4
        style={{
          fontSize: '0.65rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#c9a96e',
          marginBottom: '20px',
        }}
      >
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-forest-400 hover:text-cream-100 transition-colors"
              style={{ fontWeight: 300 }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-forest-800 bg-forest-950" id="contact">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-14">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/logo-text.svg"
              alt="Bashtoli Stationery"
              width={120}
              height={42}
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm text-forest-400 leading-relaxed" style={{ fontWeight: 300 }}>
              A curated stationery shop for writers,<br />dreamers, and ink-lovers.
            </p>
          </div>

          {/* Shop */}
          <FooterColumn
            title="Shop"
            links={[
              { label: 'Notebooks', href: '/products?category=notebooks-journals' },
              { label: 'Pens & Inks', href: '/products?category=writing-instruments' },
              { label: 'Washi Tapes', href: '/products?category=washi-tapes' },
              { label: 'Gift Sets', href: '/products?category=gift-collections' },
              { label: 'New Arrivals', href: '/products' },
            ]}
          />

          {/* Info */}
          <FooterColumn
            title="Info"
            links={[
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Track My Order', href: '/order/lookup' },
              { label: 'Cart', href: '/cart' },
            ]}
          />

          {/* Find Us */}
          <div>
            <h4
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#c9a96e',
                marginBottom: '20px',
              }}
            >
              Find Us
            </h4>
            <address className="not-italic space-y-2">
              <p className="text-sm text-forest-400 leading-relaxed" style={{ fontWeight: 300 }}>
                Shajadpur, Bashtola<br />Gulshan-1212, Dhaka
              </p>
              <p className="text-sm text-forest-400" style={{ fontWeight: 300 }}>Open 7 days &nbsp;·&nbsp; 7am – 11pm</p>
              <a
                href="mailto:hello@bashtoli.com"
                className="text-sm text-gold-500 hover:text-gold-400 transition-colors block"
              >
                hello@bashtoli.com
              </a>
              <a
                href="https://wa.me/8801825414737"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.566 0 10.1-4.507 10.103-10.03.001-2.675-1.03-5.188-2.906-7.07C16.59 1.63 14.09 1.05 11.989 1.05 6.42 1.05 1.884 5.558 1.88 11.082c-.001 1.558.423 3.082 1.23 4.426l-1.036 3.79 3.973-1.044h.01zm11.367-6.52c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
          </address>
        </div>

        {/* Location map */}
        <div>
          <h4
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c9a96e',
              marginBottom: '16px',
            }}
          >
            Location
          </h4>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #243d2e' }}>
            <iframe
              title="Bashtoli Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d852.1068079492925!2d90.42298250636408!3d23.79462584364245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c78c486ded25%3A0x63964f79a60c5a7!2z4Kas4Ka-4KaB4Ka24Kak4Kay4KeAIOCmleCmruCnjeCmquCmv-CmieCmn-CmvuCmsCAtIEJhc2h0b2xpIENvbXB1dGVy!5e0!3m2!1sen!2sbd!4v1788283104370!5m2!1sen!2sbd"
              width="100%"
              height="180"
              style={{ border: 0, display: 'block' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <a
            href="https://maps.google.com/?q=Bashtoli+Computer+Shajadpur+Dhaka"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-forest-500 mt-2 inline-block hover:text-forest-400 transition-colors"
            style={{ letterSpacing: '0.04em' }}
          >
            Open in maps &rarr;
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-forest-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p style={{ fontSize: '0.75rem', color: '#3d6e54' }}>
          &copy; {currentYear} Bashtoli Stationery. All rights reserved.
        </p>
        <div className="flex gap-6">
          <span className="text-xs text-forest-600">Privacy Policy</span>
          <span className="text-xs text-forest-600">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
  )
}

