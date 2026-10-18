import React from 'react'

export type WaveDividerVariant =
  | 'hero-to-products'
  | 'products-to-categories'
  | 'categories-to-about'
  | 'about-to-suggest'

interface WaveConfig {
  containerBg: string
  primaryWave: string
  primaryWaveFill: string
}

const WAVE_CONFIGS: Record<WaveDividerVariant, WaveConfig> = {
  // 1. Hero (Deep Forest) → Featured Products (Alabaster Cream)
  'hero-to-products': {
    containerBg: 'bg-bg-surface-dark',
    primaryWave:
      'M0,50 C260,26 420,76 720,52 C980,24 1160,14 1440,48 L1440,97 L0,97 Z',
    primaryWaveFill: 'var(--color-bg-surface)',
  },

  // 2. Featured Products (Alabaster Cream) → Categories (Forest Moss)
  'products-to-categories': {
    containerBg: 'bg-bg-surface',
    primaryWave:
      'M0,44 C320,80 580,26 920,74 C1160,92 1340,50 1440,56 L1440,97 L0,97 Z',
    primaryWaveFill: 'var(--color-bg-surface-dark-elevated)',
  },

  // 3. Categories (Forest Moss) → About Section (Alabaster Cream)
  'categories-to-about': {
    containerBg: 'bg-bg-surface-dark-elevated',
    primaryWave:
      'M0,52 C340,84 660,28 1000,68 C1180,84 1340,46 1440,54 L1440,97 L0,97 Z',
    primaryWaveFill: 'var(--color-bg-surface)',
  },

  // 4. About Section (Alabaster Cream) → Suggest an Item (Deep Forest)
  'about-to-suggest': {
    containerBg: 'bg-bg-surface',
    primaryWave:
      'M0,42 C280,20 540,78 860,48 C1120,24 1320,72 1440,58 L1440,97 L0,97 Z',
    primaryWaveFill: 'var(--color-bg-surface-dark)',
  },
}

/**
 * Organic Wave Divider connecting homepage sections with fluid elegance.
 * Flawlessly transitions between section backgrounds with exact color consistency.
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
      className={`hidden sm:block relative w-full overflow-hidden select-none pointer-events-none -mb-px z-10 ${config.containerBg} ${className}`}
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
        {/* Primary Organic Wave Surface */}
        <path d={config.primaryWave} fill={config.primaryWaveFill} />
      </svg>
    </div>
  )
}
