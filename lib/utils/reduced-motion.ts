/**
 * Check if the user has requested reduced motion without pulling GSAP
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
