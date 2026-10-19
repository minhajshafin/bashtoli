import React from 'react'

/**
 * Artisanal Bamboo & Paper Suite (বাঁশতলী Stationery)
 * Combines Papermaker's Screen Watermarks + Minimalist Sumi-e & Red Chop Seal.
 * 
 * Features:
 * 1. BashtoliChopSeal - Authentic cinnabar red (হিংলুল / Hankō) maker's stamp
 * 2. BambooPaperWatermark - Blind-deboss botanical watermark pressed into cotton paper
 * 3. DriftingBambooLeaf - Minimalist sumi-e bamboo leaves settled on the desk canvas
 */

/**
 * 1. BASHTOLI CHOP SEAL (বাঁশতলী মোহর)
 * Authentic cinnabar-red vermilion stamp inspired by traditional stationery maker seals.
 */
export function BashtoliChopSeal({
  className = '',
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-18 h-18 sm:w-20 sm:h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform -rotate-2"
      >
        {/* Softly weathered vermilion ink background */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="12"
          className="fill-btn-danger-bg/90"
        />

        {/* Hand-carved inner seal border line */}
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="8"
          stroke="var(--color-cream-50)"
          strokeWidth="2"
          strokeOpacity="0.85"
          strokeDasharray="90 2 60 2"
        />

        {/* Brand Name in Bengali Calligraphy */}
        <text
          x="50"
          y="38"
          textAnchor="middle"
          fill="var(--color-cream-50)"
          fillOpacity="0.95"
          fontSize="17"
          fontFamily="serif"
          fontWeight="600"
          letterSpacing="0.05em"
        >
          বাঁশতলী
        </text>

        {/* Center: Minimalist Bamboo Icon Stamp */}
        <g stroke="var(--color-cream-50)" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" fill="var(--color-cream-50)">
          {/* Bamboo stalk */}
          <line x1="50" y1="46" x2="50" y2="68" />
          <line x1="47" y1="56" x2="53" y2="56" strokeWidth="2.2" />
          {/* Leaves */}
          <path d="M50 56 C44 52, 38 52, 34 56 C38 55, 44 55, 50 56 Z" fillOpacity="0.9" />
          <path d="M50 56 C56 50, 62 50, 66 54 C62 53, 56 53, 50 56 Z" fillOpacity="0.9" />
          <path d="M50 48 C55 42, 61 40, 65 42 C61 43, 55 45, 50 48 Z" fillOpacity="0.9" />
        </g>

        {/* Sub-text: Dhaka · Est. 2026 */}
        <text
          x="50"
          y="80"
          textAnchor="middle"
          fill="var(--color-cream-50)"
          fillOpacity="0.85"
          fontSize="8.5"
          fontFamily="sans-serif"
          fontWeight="500"
          letterSpacing="0.16em"
        >
          DHAKA · ২০২৬
        </text>
      </svg>
    </div>
  )
}

export const AtelierChopSeal = BashtoliChopSeal

/**
 * 2. BAMBOO PAPER WATERMARK (Blind-Debossed Pulp Watermark)
 * Replicates the effect of bent-wire watermarks on handmade cotton & bamboo laid paper.
 * Appears subtly pressed into the paper without colored ink.
 */
export function BambooPaperWatermark({
  className = '',
  theme = 'light',
}: {
  className?: string
  theme?: 'light' | 'dark'
}) {
  const isLight = theme === 'light'

  return (
    <div
      className={`pointer-events-none select-none absolute overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${
          isLight
            ? 'text-forest-950/5'
            : 'text-gold-400/6'
        }`}
      >
        {/* Blind-emboss highlight/shadow offset simulation */}
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* Segmented culm branch */}
          <path
            d="M80 280 C110 230, 140 170, 175 105"
            strokeWidth="3.5"
          />
          <path
            d="M175 100 C195 65, 220 35, 245 15"
            strokeWidth="2.5"
          />

          {/* Node Rings */}
          <path d="M125 195 C132 192, 140 192, 145 195" strokeWidth="2.5" />
          <path d="M170 108 C176 105, 183 105, 187 108" strokeWidth="2.2" />

          {/* Secondary branching shoots */}
          <path d="M135 193 C160 180, 190 175, 220 178" strokeWidth="2" />
          <path d="M178 106 C205 92, 235 90, 265 95" strokeWidth="1.8" />
        </g>

        {/* Lanceolate Sumi-e Leaves (Watermark fills) */}
        <g fill="currentColor">
          {/* Node 1 leaf cluster */}
          <path d="M220 178 C250 165, 280 168, 305 180 C275 174, 245 172, 220 180 Z" />
          <path d="M220 178 C245 188, 270 205, 290 230 C265 210, 240 195, 220 180 Z" />
          <path d="M220 178 C240 160, 265 145, 290 135 C265 148, 240 162, 220 178 Z" />

          {/* Node 2 leaf cluster */}
          <path d="M265 95 C290 82, 315 82, 335 90 C310 88, 285 88, 265 96 Z" />
          <path d="M265 95 C285 105, 305 120, 320 140 C300 125, 280 112, 265 96 Z" />
          <path d="M265 95 C280 80, 300 70, 320 65 C300 75, 280 85, 265 96 Z" />

          {/* Crown tip fluttering leaves */}
          <path d="M245 15 C270 5, 295 5, 315 12 C290 9, 265 10, 245 16 Z" />
          <path d="M245 15 C265 25, 280 40, 295 58 C280 44, 260 32, 245 16 Z" />
        </g>
      </svg>
    </div>
  )
}

/**
 * 3. DRIFTING BAMBOO LEAVES (Minimalist Fallen Leaves)
 * Isolated, poetic leaves resting organically on the desk paper canvas.
 */
export function DriftingBambooLeaf({
  className = '',
  rotation = 15,
  scale = 1,
  theme = 'light',
}: {
  className?: string
  rotation?: number
  scale?: number
  theme?: 'light' | 'dark'
}) {
  const isLight = theme === 'light'

  return (
    <div
      className={`pointer-events-none select-none absolute w-12 h-6 sm:w-16 sm:h-8 ${className}`}
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${
          isLight
            ? 'text-forest-900/12'
            : 'text-gold-400/14'
        }`}
      >
        {/* Leaf blade body */}
        <path
          d="M2 16 C16 6, 42 6, 62 16 C42 22, 16 22, 2 16 Z"
          fill="currentColor"
        />
        {/* Delicate center vein line */}
        <path
          d="M2 16 C20 15, 40 15, 58 16"
          stroke={isLight ? 'var(--color-cream-100)' : 'var(--color-forest-950)'}
          strokeWidth="0.75"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

/**
 * 4. DRIFTING LEAVES PAIR
 * Two fallen leaves resting together at natural complementary angles.
 */
export function DriftingLeavesPair({
  className = '',
  theme = 'light',
}: {
  className?: string
  theme?: 'light' | 'dark'
}) {
  return (
    <div className={`pointer-events-none select-none absolute ${className}`} aria-hidden="true">
      <DriftingBambooLeaf
        className="-top-2 -left-3"
        rotation={28}
        scale={1.05}
        theme={theme}
      />
      <DriftingBambooLeaf
        className="top-3 left-4"
        rotation={-18}
        scale={0.82}
        theme={theme}
      />
    </div>
  )
}

// ----------------------------------------------------------------------------------
// Backwards Compatibility Exports (Stubs so existing references do not break)
// ----------------------------------------------------------------------------------
export const BambooHeroFlanks = () => null
export const BambooFeaturedFlanks = () => null
export const BambooCategoryFlanks = () => null
export const BambooAboutFlanks = () => null
export const BambooSuggestFlanks = () => null
export const BambooFooterFlanks = () => null
export const BambooFooterRoots = () => null
export const BambooSuggestLowerGrove = () => null
export const BambooAboutAscending = () => null
export const BambooCategoryMidStalks = () => null
export const BambooFeaturedUpper = () => null
export const BambooHeroCrown = () => null
export const BambooGroveWatermark = () => null
export const BambooBranchCorner = () => null
