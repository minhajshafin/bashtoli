'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger only on the client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Editorial Motion Constants
 * Aligned with Awwwards-standard easing curves and tactile physical stationery feedback.
 */
export const MOTION = {
  // Smooth editorial deceleration for reveals
  easeOut: 'power3.out',
  // High-contrast dramatic ease for hero entrances
  easeExpo: 'expo.out',
  // Tactile spring physics for click releases, badges, and toggles
  easeSpring: 'back.out(2.5)',
  // Snappy compression for mechanical button clicks
  easePress: 'power2.in',
  // Smooth natural transition for modals and drawers
  easeSmooth: 'power2.out',
} as const

/**
 * Check if the user has requested reduced motion
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Minimal GSAP Button Click Impulse
 * Triggers an instant, tactile physical spring press on click.
 * Emulates the mechanical feel of an artisanal brass clicker or typewriter key.
 */
export function triggerTactileClick(element: HTMLElement | EventTarget | null): void {
  if (!element || !(element instanceof HTMLElement)) return
  if (isReducedMotion()) return

  // Cancel any ongoing scale animations to prevent jitter
  gsap.killTweensOf(element, 'scale')

  // Quick 80ms compression followed by a 180ms spring recovery
  const tl = gsap.timeline({ overwrite: 'auto' })
  tl.to(element, {
    scale: 0.96,
    duration: 0.08,
    ease: MOTION.easePress,
  }).to(element, {
    scale: 1.0,
    duration: 0.18,
    ease: MOTION.easeSpring,
    clearProps: 'scale',
  })
}

export { gsap, ScrollTrigger }
