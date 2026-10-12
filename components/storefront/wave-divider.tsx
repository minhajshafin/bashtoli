import React from 'react'

export type WaveDividerVariant =
  | 'hero-to-products'
  | 'products-to-categories'
  | 'categories-to-about'
  | 'about-to-suggest'

interface WaveConfig {
  containerBg: string
  underSwell: string
  underSwellFill: string
  primaryWave: string
  primaryWaveFill: string
  contour: string
  contourStroke: string
}

const WAVE_CONFIGS: Record<WaveDividerVariant, WaveConfig> = {
  // 1. Hero (Deep Forest #0a160f) → Featured Products (Alabaster Cream #f6f0e4)
  'hero-to-products': {
    containerBg: 'bg-forest-950',
    underSwell:
      'M0,38 C280,14 440,64 740,40 C1000,12 1180,4 1440,36 L1440,97 L0,97 Z',
    underSwellFill: 'rgba(196, 162, 101, 0.18)',
    primaryWave:
      'M0,50 C260,26 420,76 720,52 C980,24 1160,14 1440,48 L1440,97 L0,97 Z',
    primaryWaveFill: '#f6f0e4',
    contour:
      'M0,50 C260,26 420,76 720,52 C980,24 1160,14 1440,48',
    contourStroke: 'rgba(196, 162, 101, 0.45)',
  },

  // 2. Featured Products (Alabaster Cream #f6f0e4) → Categories (Forest Moss #102218)
  'products-to-categories': {
    containerBg: 'bg-cream-100',
    underSwell:
      'M0,32 C300,68 560,14 900,62 C1140,80 1320,38 1440,44 L1440,97 L0,97 Z',
    underSwellFill: 'rgba(16, 34, 24, 0.14)',
    primaryWave:
      'M0,44 C320,80 580,26 920,74 C1160,92 1340,50 1440,56 L1440,97 L0,97 Z',
    primaryWaveFill: '#102218',
    contour:
      'M0,44 C320,80 580,26 920,74 C1160,92 1340,50 1440,56',
    contourStroke: 'rgba(196, 162, 101, 0.38)',
  },

  // 3. Categories (Forest Moss #102218) → About Section (Alabaster Cream #f6f0e4)
  'categories-to-about': {
    containerBg: 'bg-forest-900',
    underSwell:
      'M0,40 C320,72 640,16 980,56 C1160,72 1320,34 1440,42 L1440,97 L0,97 Z',
    underSwellFill: 'rgba(196, 162, 101, 0.18)',
    primaryWave:
      'M0,52 C340,84 660,28 1000,68 C1180,84 1340,46 1440,54 L1440,97 L0,97 Z',
    primaryWaveFill: '#f6f0e4',
    contour:
      'M0,52 C340,84 660,28 1000,68 C1180,84 1340,46 1440,54',
    contourStroke: 'rgba(196, 162, 101, 0.45)',
  },

  // 4. About Section (Alabaster Cream #f6f0e4) → Suggest an Item (Deep Forest #0a160f)
  'about-to-suggest': {
    containerBg: 'bg-cream-100',
    underSwell:
      'M0,30 C260,8 520,66 840,36 C1100,12 1300,60 1440,46 L1440,97 L0,97 Z',
    underSwellFill: 'rgba(10, 22, 15, 0.14)',
    primaryWave:
      'M0,42 C280,20 540,78 860,48 C1120,24 1320,72 1440,58 L1440,97 L0,97 Z',
    primaryWaveFill: '#0a160f',
    contour:
      'M0,42 C280,20 540,78 860,48 C1120,24 1320,72 1440,58',
    contourStroke: 'rgba(196, 162, 101, 0.38)',
  },
}

/**
 * Direction 1: The Elevated "Sugeta" Layered Wave Divider.
 * Two-tier organic swell inspired by papermaking pulp waves on bamboo screens,
 * featuring an ethereal translucent under-swell and a burnished gold hairline contour.
 * Scaled with enhanced vertical presence and graceful fluid curves.
 */
export function WaveDivider({
  variant,
  className = '',
}: {
  variant: WaveDividerVariant
  className?: string
}) {
  const config = WAVE_CONFIGS[variant]

  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none -mb-px z-10 ${config.containerBg} ${className}`}
      style={{
        height: 'clamp(60px, 8vw, 120px)',
        marginBottom: '-1px',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        {/* Layer 1: Ethereal Under-Swell Wash */}
        <path d={config.underSwell} fill={config.underSwellFill} />

        {/* Layer 2: Primary Organic Wave Surface */}
        <path d={config.primaryWave} fill={config.primaryWaveFill} />

        {/* Layer 3: Artisanal Hairline Accent Contour */}
        <path
          d={config.contour}
          stroke={config.contourStroke}
          strokeWidth="1.25"
          fill="none"
        />
      </svg>
    </div>
  )
}
