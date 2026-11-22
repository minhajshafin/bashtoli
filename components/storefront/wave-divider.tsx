import React from 'react'

export type WaveDividerVariant = 'hero-to-products'

interface WaveConfig {
  containerBg: string
  primaryWave: string
  primaryWaveFill: string
}

const WAVE_CONFIGS: Record<WaveDividerVariant, WaveConfig> = {
  // Hero (Deep Forest) → Featured Products (Alabaster Cream)
  'hero-to-products': {
    containerBg: 'bg-bg-surface-dark',
    primaryWave:
      'M0,50 C260,26 420,76 720,52 C980,24 1160,14 1440,48 L1440,97 L0,97 Z',
    primaryWaveFill: 'var(--color-bg-surface)',
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
