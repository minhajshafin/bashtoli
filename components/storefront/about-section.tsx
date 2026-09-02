import React from 'react'
import Link from 'next/link'

export function AboutSection() {
  return (
    <section
      id="aboutus"
      className="py-12 px-5 md:px-8 bg-cream-100 scroll-mt-35"
      style={{ scrollMarginTop: '140px' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center">
        {/* Image */}
        <div className="shrink-0 w-full md:w-56 lg:w-64">
          <img
            src="https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=500&h=500&fit=crop&auto=format"
            alt="Cozy stationery setup with notebook and candle"
            className="w-full object-cover rounded-[20px]"
            style={{ aspectRatio: '1/1' }}
            loading="lazy"
          />
        </div>

        {/* Text */}
        <div className="flex-1">
          <p
            className="text-[11px] uppercase tracking-[0.28em] mb-3"
            style={{ color: '#c9a96e', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
          >
            Our Story
          </p>
          <p
            className="mb-3 leading-relaxed"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(0.85rem, 0.8rem + 0.5vw, 1.1rem)',
              color: '#2d5240',
              fontStyle: 'italic',
              lineHeight: 1.55,
            }}
          >
            &ldquo;A notebook is a letter to your future self.&rdquo;
          </p>
          <h2
            className="mb-3"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
              color: '#1a3326',
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.15,
            }}
          >
            Born from a love of beautiful things
          </h2>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: '#2d5240', fontWeight: 300, maxWidth: '480px' }}
          >
            বাঁশতলী began as a weekend market stall — today it is a destination for writers,
            artists, and anyone who still finds joy in putting ink to paper. Every item is
            held, tested, and written with before it earns shelf space.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-full bg-forest-800 text-cream-100 hover:bg-gold-500 hover:text-forest-900 transition-colors"
            >
              Explore Collection &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
