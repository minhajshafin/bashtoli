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

export interface HorizontalLoopTimeline extends gsap.core.Timeline {
  next: (vars?: gsap.TweenVars) => gsap.core.Tween
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween
  current: () => number
  times: number[]
}

export interface HorizontalLoopConfig {
  speed?: number
  paused?: boolean
  repeat?: number
  paddingRight?: number
  reversed?: boolean
  snap?: number | boolean | ((value: number) => number)
}

/**
 * GreenSock Awwwards-Standard Horizontal Loop Helper
 * Seamlessly loops an array of DOM elements along the x-axis using GPU xPercent transforms.
 * Supports continuous auto-drift, non-stopping next/previous skipping, and hover pause.
 */
export function horizontalLoop(
  items: HTMLElement[],
  config: HorizontalLoopConfig = {}
): HorizontalLoopTimeline {
  items = gsap.utils.toArray(items)
  const length = items.length
  const tl = gsap.timeline({
    repeat: config.repeat ?? -1,
    paused: config.paused,
    defaults: { ease: 'none' },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100)
    },
  }) as HorizontalLoopTimeline

  if (length === 0) {
    tl.next = () => gsap.to({}, {})
    tl.previous = () => gsap.to({}, {})
    tl.toIndex = () => gsap.to({}, {})
    tl.current = () => 0
    tl.times = []
    return tl
  }

  const startX = items[0].offsetLeft
  const times: number[] = []
  const widths: number[] = []
  const xPercents: number[] = []
  let curIndex = 0
  const pixelsPerSecond = (config.speed || 1) * 60

  gsap.set(items, {
    xPercent: (i, el) => {
      const w = (widths[i] = parseFloat(window.getComputedStyle(el).width))
      xPercents[i] =
        ((Number(gsap.getProperty(el, 'x', 'px')) || 0) / (w || 1)) * 100 +
        Number(gsap.getProperty(el, 'xPercent') || 0)
      return xPercents[i]
    },
  })
  gsap.set(items, { x: 0 })

  const scaleLast = Number(gsap.getProperty(items[length - 1], 'scaleX') || 1)
  const totalWidth =
    items[length - 1].offsetLeft +
    (widths[length - 1] / 100) * xPercents[length - 1] -
    startX +
    items[length - 1].offsetWidth * scaleLast +
    (Number(config.paddingRight) || 0)

  for (let i = 0; i < length; i++) {
    const item = items[i]
    const curX = (xPercents[i] / 100) * widths[i]
    const distanceToStart = item.offsetLeft + curX - startX
    const itemScale = Number(gsap.getProperty(item, 'scaleX') || 1)
    const distanceToLoop = distanceToStart + widths[i] * itemScale

    tl.to(
      item,
      {
        xPercent: gsap.utils.snap(0.001, ((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: gsap.utils.snap(0.001, ((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
        },
        {
          xPercent: xPercents[i],
          duration: (totalWidth - distanceToLoop) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add('label' + i, distanceToStart / pixelsPerSecond)

    times[i] = distanceToStart / pixelsPerSecond
  }

  function toIndex(index: number, vars?: gsap.TweenVars) {
    vars = vars || {}
    if (Math.abs(index - curIndex) > length / 2) {
      index += index > curIndex ? -length : length
    }
    const newIndex = gsap.utils.wrap(0, length, index)
    let time = times[newIndex]
    if (time > tl.time() !== index > curIndex) {
      time += tl.duration() * (index > curIndex ? 1 : -1)
    }
    curIndex = newIndex
    vars.overwrite = true
    return tl.tweenTo(time, vars)
  }

  tl.next = (vars?: gsap.TweenVars) => toIndex(curIndex + 1, vars)
  tl.previous = (vars?: gsap.TweenVars) => toIndex(curIndex - 1, vars)
  tl.toIndex = (index: number, vars?: gsap.TweenVars) => toIndex(index, vars)
  tl.current = () => curIndex
  tl.times = times

  tl.progress(1, true).progress(0, true)
  if (config.reversed) {
    tl.vars.onReverseComplete?.()
    tl.reverse()
  }

  return tl
}

export { gsap, ScrollTrigger }
