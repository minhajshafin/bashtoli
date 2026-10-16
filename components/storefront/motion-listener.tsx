'use client'

import { useEffect } from 'react'
import { gsap, isReducedMotion } from '@/lib/motion'

/**
 * Global Tactile Motion Listener.
 * Provides micro-press spring interaction across all interactive buttons on the storefront.
 * Simulates physical mechanical button actuation on pointerdown, releasing with a tactile spring on pointerup.
 */
export function MotionListener() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePointerDown = (e: PointerEvent) => {
      // Left click or primary touch only
      if (e.button !== 0) return
      if (isReducedMotion()) return

      const target = e.target as HTMLElement | null
      if (!target) return

      // Find closest actionable button or link with button utility class
      const btn = target.closest<HTMLElement>(
        'button, .btn-primary, .btn-accent, .btn-secondary, .btn-dark, .btn-danger, [data-tactile="true"]'
      )

      if (!btn) return
      if (btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true') return
      // Skip if inside an input or editable field
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      // Snappy micro-compression
      gsap.killTweensOf(btn)
      gsap.to(btn, {
        scale: 0.96,
        duration: 0.08,
        ease: 'power2.out',
      })

      const handleRelease = () => {
        gsap.to(btn, {
          scale: 1.0,
          duration: 0.2,
          ease: 'back.out(2.5)',
          clearProps: 'scale',
        })
        window.removeEventListener('pointerup', handleRelease)
        window.removeEventListener('pointercancel', handleRelease)
      }

      window.addEventListener('pointerup', handleRelease, { once: true })
      window.addEventListener('pointercancel', handleRelease, { once: true })
    }

    document.addEventListener('pointerdown', handlePointerDown, { passive: true })

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  return null
}
