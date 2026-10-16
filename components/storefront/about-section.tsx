import React from 'react'
import Image from 'next/image'
import { ScrollReveal } from '@/components/storefront/scroll-reveal'

export function AboutSection() {
  return (
    <section
      id="aboutus"
      className="relative overflow-hidden py-8 sm:py-10 lg:py-12 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 2xl:px-28 bg-cream-100 bg-laid-paper scroll-mt-20"
    >
      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left: Minimal Archival Photo */}
        <ScrollReveal className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[240px] sm:max-w-[260px] lg:max-w-[280px]">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-cream-50 border border-forest-900/10 shadow-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-200 shadow-inner">
                <Image
                  src="https://images.unsplash.com/photo-1694754920848-8855ee3ff364?w=800&h=1000&fit=crop&auto=format"
                  alt="Cozy stationery setup with handcrafted journal and fountain pen"
                  fill
                  sizes="(max-width: 768px) 240px, (max-width: 1024px) 260px, 280px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right: Minimal Editorial Narrative */}
        <ScrollReveal delay={0.12} className="lg:col-span-7 text-left max-w-xl">
          {/* Subtle Overline Kicker */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="h-px w-4 bg-gold-500/60" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-gold-700/90">
              Our Story &middot; Dhaka, Est. 2026
            </span>
          </div>

          {/* Statement Headline */}
          <h2 className="font-display font-medium text-forest-950 text-xl sm:text-2xl lg:text-[1.75rem] leading-snug tracking-[-0.015em] mb-3">
            Born from a love of{' '}
            <em className="font-editorial italic font-normal text-forest-900">
              beautiful things
            </em>
            <span className="text-gold-600/80">.</span>
          </h2>

          {/* Editorial Lead Hook */}
          <p className="font-display text-forest-900 text-sm sm:text-[15px] lg:text-base leading-relaxed font-normal mb-2.5">
            A quiet neighbourhood corner in Dhaka for anyone who still finds joy in the simple, tactile act of putting pen to paper.
          </p>

          {/* Body Narrative */}
          <p className="text-xs sm:text-[13px] leading-relaxed text-forest-800/80 font-sans font-normal">
            বাঁশতলী began as a modest weekend stall — born from a fondness for fountain pens, honest bamboo paper, and stationery made with care. Every notebook, pencil, and paper pack is held, tested, and handwritten with before it earns a spot on our shelves.
          </p>

          {/* Minimal Footnote Quote */}
          <div className="pt-3 mt-3.5 border-t border-forest-200/50">
            <blockquote className="font-display italic text-forest-900/85 text-xs sm:text-[13px] leading-relaxed">
              &ldquo;A notebook is a letter to your future self.&rdquo;
            </blockquote>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
