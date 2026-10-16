'use client'

import React, { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, isReducedMotion } from '@/lib/motion'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  y?: number
  duration?: number
  delay?: number
}

/**
 * Minimal Editorial ScrollReveal
 * Triggers a single-fire, gentle rise-and-fade for section headings and curated story cards.
 * Zero layout shifts, zero scroll hijacking, completely disabled when prefers-reduced-motion is true.
 */
export function ScrollReveal({
  children,
  className = '',
  y = 16,
  duration = 0.65,
  delay = 0,
}: ScrollRevealProps) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isReducedMotion() || !elRef.current) return

    const el = elRef.current
    gsap.registerPlugin(ScrollTrigger)

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          el,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        )
      },
    })

    return () => {
      trigger.kill()
    }
  }, [y, duration, delay])

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  )
}
