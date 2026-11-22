'use client'

import React, { useEffect, useRef, useState } from 'react'
import { isReducedMotion } from '@/lib/utils/reduced-motion'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  y?: number
  duration?: number
  delay?: number
}

/**
 * High-performance Native IntersectionObserver ScrollReveal.
 * Replaces heavy GSAP ScrollTrigger plugin with native browser IntersectionObserver.
 * Zero layout shifts, zero main-thread blocking, fully accessible.
 */
export function ScrollReveal({
  children,
  className = '',
  y = 16,
  duration = 0.65,
  delay = 0,
}: ScrollRevealProps) {
  const elRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isReducedMotion()) {
      requestAnimationFrame(() => setIsVisible(true))
      return
    }

    const el = elRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      requestAnimationFrame(() => setIsVisible(true))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style: React.CSSProperties = isVisible
    ? {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }
    : {
        opacity: 0,
        transform: `translate3d(0, ${y}px, 0)`,
      }

  return (
    <div ref={elRef} className={className} style={style}>
      {children}
    </div>
  )
}
