export const HERO_SLIDE_MIN_COUNT = 1
export const HERO_SLIDE_MAX_COUNT = 6

export const BADGE_COLOR_PRESETS = {
  gold: {
    label: 'Signature Gold',
    bg: '#c9a96e',
    text: '#1a3326',
    border: 'rgba(201,169,110,0.4)',
  },
  forest: {
    label: 'Forest Green',
    bg: '#2d5240',
    text: '#f5ede0',
    border: 'rgba(45,82,64,0.4)',
  },
  crimson: {
    label: 'Crimson Sale',
    bg: '#c94f3d',
    text: '#ffffff',
    border: 'rgba(201,79,61,0.4)',
  },
  ocean: {
    label: 'Ocean Blue',
    bg: '#3b7097',
    text: '#ffffff',
    border: 'rgba(59,112,151,0.4)',
  },
  slate: {
    label: 'Warm Slate',
    bg: '#5c6460',
    text: '#ffffff',
    border: 'rgba(92,100,96,0.4)',
  },
} as const

export type BadgeColorPresetKey = keyof typeof BADGE_COLOR_PRESETS

export interface HeroSlideItem {
  id: string
  image_url: string
  alt_text: string | null
  badge_text: string
  badge_color_preset: BadgeColorPresetKey
  link_url: string
  subtext: string
  sort_order: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export const DEFAULT_FALLBACK_SLIDE: HeroSlideItem = {
  id: 'default-fallback-slide',
  image_url: '/logo-text.svg',
  alt_text: 'Bashtoli Stationery',
  badge_text: 'New Collection',
  badge_color_preset: 'gold',
  link_url: '/products',
  subtext: 'Now in store & online',
  sort_order: 0,
  active: true,
}
