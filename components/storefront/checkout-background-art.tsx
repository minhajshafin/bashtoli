import React from 'react'

/**
 * CheckoutBackgroundArt
 * Renders handcrafted botanical bamboo artwork, archival laid-paper dot grid,
 * and warm ambient light matching the rest of the Bashtoli storefront.
 */
interface CheckoutBackgroundArtProps {
  className?: string
  variant?: 'light' | 'dark'
}

export function CheckoutBackgroundArt({ className, variant = 'light' }: CheckoutBackgroundArtProps = {}) {
  const isDark = variant === 'dark'

  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden select-none z-0 ${className || ''}`}
      aria-hidden="true"
    >
      {/* 1. Ambient Laid-Paper Radial Light */}
      <div
        className={`absolute inset-0 ${isDark ? 'opacity-40' : 'opacity-70'}`}
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 20%, rgba(201, 169, 110, 0.14) 0%, rgba(16, 34, 24, 0.5) 60%, transparent 85%)'
            : 'radial-gradient(circle at 50% 20%, rgba(255, 253, 248, 0.8) 0%, rgba(246, 240, 228, 0.35) 55%, transparent 80%)',
        }}
      />

      {/* 2. Delicate Stationery Dot-Grid Pattern */}
      <svg
        className={`absolute inset-0 h-full w-full opacity-[0.035] ${isDark ? 'text-gold-400' : 'text-forest-950'}`}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="checkout-stationery-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#checkout-stationery-dots)" />
      </svg>

      {/* 3. Top-Right Botanical Bamboo Foliage */}
      <svg
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`hidden sm:block absolute -top-12 -right-16 sm:-right-8 w-[380px] sm:w-[480px] lg:w-[540px] max-w-none ${
          isDark ? 'text-gold-400/[0.09]' : 'text-forest-900/[0.07]'
        } transition-opacity duration-700`}
      >
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M580 10 C460 60, 360 140, 280 260" strokeWidth="2.5" />
          <path d="M280 260 C240 320, 200 390, 170 460" strokeWidth="1.8" strokeDasharray="95 3 60 2" />
          <path d="M510 40 C506 48, 514 53, 518 45" strokeWidth="2" />
          <path d="M420 95 C416 103, 424 108, 428 100" strokeWidth="2" />
          <path d="M340 180 C336 188, 344 193, 348 185" strokeWidth="1.8" />
          <path d="M512 45 C460 65, 410 70, 360 60" strokeWidth="1.2" />
          <path d="M422 100 C370 120, 330 150, 300 200" strokeWidth="1.2" />
          <path d="M342 185 C290 200, 240 230, 210 270" strokeWidth="1" />
        </g>
        <g fill="currentColor">
          <path d="M360 60 C320 50, 270 55, 230 75 C270 68, 310 68, 360 60 Z" />
          <path d="M360 60 C330 75, 290 100, 260 130 C290 105, 325 85, 360 60 Z" />
          <path d="M300 200 C260 185, 210 190, 170 215 C210 205, 250 205, 300 200 Z" />
          <path d="M300 200 C270 215, 235 240, 205 275 C235 248, 268 228, 300 200 Z" />
          <path d="M210 270 C175 260, 130 270, 95 295 C135 282, 175 280, 210 270 Z" />
        </g>
      </svg>

      {/* 4. Bottom-Left Ascending Bamboo Stems */}
      <svg
        viewBox="0 0 500 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`hidden sm:block absolute -bottom-16 -left-16 sm:-left-8 w-[340px] sm:w-[440px] max-w-none ${
          isDark ? 'text-gold-400/[0.08]' : 'text-forest-900/[0.06]'
        }`}
      >
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M80 620 C90 480, 110 320, 140 160" strokeWidth="2.5" />
          <path d="M140 160 C155 80, 175 20, 195 -30" strokeWidth="1.8" strokeDasharray="90 3 60 2" />
          <path d="M88 510 C96 507, 104 507, 112 510" strokeWidth="2" />
          <path d="M102 380 C110 377, 118 377, 126 380" strokeWidth="1.8" />
          <path d="M102 380 C135 365, 170 360, 205 365" strokeWidth="1.2" />
        </g>
        <g fill="currentColor">
          <path d="M205 365 C240 350, 280 355, 310 375 C275 368, 240 368, 205 365 Z" />
          <path d="M205 365 C235 380, 265 405, 290 435 C265 410, 235 390, 205 365 Z" />
        </g>
      </svg>

      {/* 5. Seal Watermark in Corner */}
      <div className="hidden lg:block absolute bottom-6 right-8 opacity-25 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="4"
            y="4"
            width="72"
            height="72"
            rx="12"
            stroke="var(--color-terracotta-500)"
            strokeWidth="1.5"
            strokeDasharray="60 2 40 2"
            className="opacity-40"
          />
          <text
            x="40"
            y="36"
            textAnchor="middle"
            fill="var(--color-terracotta-500)"
            fillOpacity="0.45"
            fontSize="15"
            fontFamily="serif"
            fontWeight="600"
          >
            বাঁশতলী
          </text>
          <text
            x="40"
            y="56"
            textAnchor="middle"
            fill="var(--color-terracotta-500)"
            fillOpacity="0.35"
            fontSize="7"
            fontFamily="sans-serif"
            letterSpacing="0.16em"
          >
            DHAKA · ২০২৬
          </text>
        </svg>
      </div>
    </div>
  )
}
