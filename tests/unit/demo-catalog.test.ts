import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import demoCatalog from '../../supabase/seed/demo-catalog.json'

// ── Zod Schemas for demo-catalog.json ─────────────────────────

const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/
const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(KEBAB_CASE_REGEX, 'Must be kebab-case'),
  sort_order: z.number().int().positive(),
  is_featured: z.boolean(),
  featured_order: z.number().int().min(0).max(7),
  color_token: z.enum([
    'forest',
    'ink',
    'terracotta',
    'cream',
    'slate',
    'ocean',
    'gold',
    'moss',
  ]),
  description: z.string().min(1),
})

const heroSlideSchema = z.object({
  badge_text: z.string().min(1),
  badge_color_preset: z.string().min(1),
  link_url: z.string().startsWith('/products'),
  subtext: z.string().min(1),
  sort_order: z.number().int().positive(),
  active: z.boolean(),
})

const variantSchema = z.object({
  sku: z.string().startsWith('DEMO-', 'SKU must start with DEMO-'),
  price: z
    .number()
    .int()
    .positive()
    .refine((p) => p % 5 === 0, 'Price must be rounded to 5 or 10'),
  stock_qty: z.number().int().min(0),
  active: z.boolean(),
  option_values: z.record(z.string(), z.string()),
})

const optionSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1),
})

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(KEBAB_CASE_REGEX, 'Must be kebab-case'),
  category_slug: z.string().regex(KEBAB_CASE_REGEX),
  item_type: z.string().min(1),
  description: z.string().min(1),
  active: z.boolean(),
  featured: z.boolean(),
  image_label: z.string().min(1),
  image_color: z.enum([
    'forest',
    'ink',
    'terracotta',
    'cream',
    'slate',
    'ocean',
    'gold',
    'moss',
  ]),
  image_slots: z.number().int().min(0).max(3),
  image_labels: z.array(z.string().min(1)).min(0).max(3),
  options: z.array(optionSchema),
  variants: z.array(variantSchema).min(1),
  base_price: z
    .number()
    .int()
    .positive()
    .refine((p) => p % 5 === 0, 'Base price must be rounded to 5 or 10'),
  stress: z
    .enum([
      'sold-out',
      'zero-images',
      'long-text',
      'six-variants',
      'bengali-locale',
    ])
    .optional(),
})

const catalogSchema = z.object({
  version: z.literal(4),
  categories: z.array(categorySchema).length(8),
  hero_slides: z.array(heroSlideSchema).length(3),
  products: z.array(productSchema).length(50),
})

// ── Official Price Bands (BDT) ────────────────────────────────

const ITEM_TYPE_PRICE_BANDS: Record<string, [number, number]> = {
  'single pen': [10, 60],
  'pen pack': [60, 250],
  'premium pen': [250, 900],
  'pencil': [5, 15],
  'pencil pack': [60, 120],
  'colored pencils': [120, 450],
  'school notebook': [60, 180],
  'hardcover journal': [180, 650],
  'handmade-paper journal': [450, 1200],
  'A4 ream': [450, 650],
  'colored paper pack': [60, 200],
  'sticker paper': [100, 300],
  'watercolor set': [150, 450],
  'sketchbook': [180, 600],
  'marker set': [180, 500],
  'acrylic set': [350, 1200],
  'brush': [80, 350],
  'stapler': [120, 450],
  'staple pins': [20, 60],
  'tape': [20, 80],
  'scissors': [60, 200],
  'glue stick': [25, 80],
  'file folder': [30, 150],
  'paper clips': [20, 60],
  'sticky notes': [40, 180],
  'highlighter set': [80, 300],
  'desk organizer': [250, 900],
  'geometry box': [120, 450],
  'ruler': [15, 80],
  'basic calculator': [300, 600],
  'scientific calculator': [700, 1800],
  'gift wrap': [30, 150],
  'greeting cards': [40, 200],
  'washi tape': [60, 250],
  // New local staple price bands
  'ledger register': [180, 420],
  'exam writing pad': [60, 140],
  'whiteboard marker 4-pack': [100, 260],
  'eraser and sharpener combo pack': [20, 70],
  'correction fluid bottle': [30, 90],
  'ink stamp pad': [60, 180],
  'envelope pack': [40, 160],
  'two-hole paper punch': [120, 400],
}

// ── Forbidden Third-Party Brands ─────────────────────────────

const FORBIDDEN_BRANDS = [
  'matador',
  'faber',
  'castell',
  'casio',
  'pilot',
  'post-it',
  'postit',
  'bic',
  'staedtler',
  'sharpie',
  'moleskine',
  'zebra',
  'pentel',
  'uni-ball',
  'uniball',
  'kokuyo',
  'rhodia',
  'parker',
  'lamy',
]

describe('Demo Catalog (demo-catalog.json)', () => {
  it('validates catalog schema structure and version 4 with Zod', () => {
    const parsed = catalogSchema.safeParse(demoCatalog)
    expect(parsed.success).toBe(true)
  })

  it('contains no random UUIDs anywhere in the file', () => {
    const raw = JSON.stringify(demoCatalog)
    const matches = raw.match(UUID_REGEX)
    expect(matches).toBeNull()
  })

  it('contains no image URLs in any product', () => {
    const raw = JSON.stringify(demoCatalog.products)
    expect(raw).not.toMatch(/https?:\/\//i)
    expect(raw).not.toMatch(/\.(png|jpg|jpeg|webp|gif|svg)/i)
  })

  describe('Categories', () => {
    it('has exactly 8 categories with unique kebab-case slugs', () => {
      expect(demoCatalog.categories).toHaveLength(8)
      const slugs = demoCatalog.categories.map((c) => c.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(8)
    })

    it('has exactly 7 featured categories with featured_order 1 to 7', () => {
      const featured = demoCatalog.categories.filter((c) => c.is_featured)
      expect(featured).toHaveLength(7)
      const orders = featured.map((c) => c.featured_order).sort((a, b) => a - b)
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('has exactly 1 unfeatured category (Study & Exam Essentials with featured_order 0)', () => {
      const unfeatured = demoCatalog.categories.filter((c) => !c.is_featured)
      expect(unfeatured).toHaveLength(1)
      expect(unfeatured[0].name).toBe('Study & Exam Essentials')
      expect(unfeatured[0].featured_order).toBe(0)
    })
  })

  describe('Hero Slides', () => {
    it('has 3 active hero slides with valid routes and badge text', () => {
      expect(demoCatalog.hero_slides).toHaveLength(3)
      for (const slide of demoCatalog.hero_slides) {
        expect(slide.link_url.startsWith('/products')).toBe(true)
        expect(slide.badge_text.length).toBeGreaterThan(0)
        expect(slide.subtext.length).toBeGreaterThan(0)
        expect(slide.active).toBe(true)
      }
      const sortOrders = demoCatalog.hero_slides.map((s) => s.sort_order).sort()
      expect(sortOrders).toEqual([1, 2, 3])
    })
  })

  describe('Products & Variants', () => {
    it('has exactly 50 products', () => {
      expect(demoCatalog.products).toHaveLength(50)
    })

    it('distributes 5 to 8 products per category', () => {
      const counts: Record<string, number> = {}
      for (const p of demoCatalog.products) {
        counts[p.category_slug] = (counts[p.category_slug] || 0) + 1
      }
      for (const cat of demoCatalog.categories) {
        const count = counts[cat.slug] || 0
        expect(count).toBeGreaterThanOrEqual(5)
        expect(count).toBeLessThanOrEqual(8)
      }
    })

    it('has unique kebab-case slugs for all products', () => {
      const slugs = demoCatalog.products.map((p) => p.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(50)
    })

    it('has unique SKUs starting with DEMO- for all variants', () => {
      const allSkus = demoCatalog.products.flatMap((p) => p.variants.map((v) => v.sku))
      expect(allSkus.length).toBeGreaterThan(50)
      for (const sku of allSkus) {
        expect(sku.startsWith('DEMO-')).toBe(true)
      }
      const uniqueSkus = new Set(allSkus)
      expect(uniqueSkus.size).toBe(allSkus.length)
    })

    it('has multi-variant products (2 to 6 variants) and single-variant products', () => {
      const multi = demoCatalog.products.filter((p) => p.variants.length > 1)
      const single = demoCatalog.products.filter((p) => p.variants.length === 1)
      expect(multi.length).toBeGreaterThanOrEqual(14)
      expect(multi.length).toBeLessThanOrEqual(18)
      expect(multi.length + single.length).toBe(50)
      for (const p of multi) {
        expect(p.variants.length).toBeGreaterThanOrEqual(2)
        expect(p.variants.length).toBeLessThanOrEqual(6)
        expect(p.options.length).toBeGreaterThan(0)
      }
      for (const p of single) {
        expect(p.options).toEqual([])
        expect(p.variants[0].option_values).toEqual({})
      }
    })

    it('ensures base_price equals lowest active variant price for every product', () => {
      for (const p of demoCatalog.products) {
        const activeVariants = p.variants.filter((v) => v.active)
        const candidates = activeVariants.length > 0 ? activeVariants : p.variants
        const lowestVariantPrice = Math.min(...candidates.map((v) => v.price))
        expect(p.base_price).toBe(lowestVariantPrice)
      }
    })

    it('ensures all variant prices fall within their designated item-type price bands', () => {
      for (const p of demoCatalog.products) {
        const band = ITEM_TYPE_PRICE_BANDS[p.item_type]
        expect(band, `Unknown item_type: ${p.item_type}`).toBeDefined()
        const [minBand, maxBand] = band
        for (const v of p.variants) {
          expect(v.price).toBeGreaterThanOrEqual(minBand)
          expect(v.price).toBeLessThanOrEqual(maxBand)
        }
      }
    })
  })

  describe('Inventory & Status Rules', () => {
    it('has exactly 4 products with low stock (total product stock 1 to 5)', () => {
      const lowStockProducts = demoCatalog.products.filter((p) => {
        const totalStock = p.variants.reduce((sum, v) => sum + v.stock_qty, 0)
        return totalStock >= 1 && totalStock <= 5
      })
      expect(lowStockProducts).toHaveLength(4)
    })

    it('has exactly 3 variants with 0 stock', () => {
      const zeroVariants = demoCatalog.products.flatMap((p) =>
        p.variants.filter((v) => v.stock_qty === 0)
      )
      expect(zeroVariants).toHaveLength(3)
    })

    it('keeps other product variant inventory in healthy stock range (mostly 20 to 200)', () => {
      const lowStockSlugs = new Set(
        demoCatalog.products
          .filter((p) => {
            const total = p.variants.reduce((s, v) => s + v.stock_qty, 0)
            return total >= 1 && total <= 5
          })
          .map((p) => p.slug)
      )
      for (const p of demoCatalog.products) {
        if (lowStockSlugs.has(p.slug)) continue
        for (const v of p.variants) {
          if (v.stock_qty === 0) continue
          expect(v.stock_qty).toBeGreaterThanOrEqual(20)
          expect(v.stock_qty).toBeLessThanOrEqual(200)
        }
      }
    })

    it('has exactly 3 inactive (draft) products', () => {
      const inactive = demoCatalog.products.filter((p) => !p.active)
      expect(inactive).toHaveLength(3)
    })

    it('has exactly 8 featured products', () => {
      const featured = demoCatalog.products.filter((p) => p.featured)
      expect(featured).toHaveLength(8)
    })

    it('has exactly 10 products with 3 image slots and 3 image labels', () => {
      const threeSlots = demoCatalog.products.filter(
        (p) => p.image_slots === 3 && p.image_labels.length === 3
      )
      expect(threeSlots).toHaveLength(10)
    })
  })

  describe('UI Stress Cases', () => {
    it('asserts exactly one active product with ALL variants at stock 0 (fully sold out)', () => {
      const soldOut = demoCatalog.products.filter(
        (p) => p.active && p.variants.every((v) => v.stock_qty === 0)
      )
      expect(soldOut).toHaveLength(1)
      expect(soldOut[0].stress).toBe('sold-out')
    })

    it('asserts exactly one active product with zero images (image_slots 0)', () => {
      const zeroImage = demoCatalog.products.filter((p) => p.image_slots === 0)
      expect(zeroImage).toHaveLength(1)
      expect(zeroImage[0].stress).toBe('zero-images')
      expect(zeroImage[0].image_labels).toEqual([])
    })

    it('asserts exactly one 6-variant product on a single option axis', () => {
      const sixVariants = demoCatalog.products.filter((p) => p.variants.length === 6)
      expect(sixVariants).toHaveLength(1)
      expect(sixVariants[0].stress).toBe('six-variants')
      expect(sixVariants[0].options).toHaveLength(1)
      expect(sixVariants[0].options[0].values).toHaveLength(6)
    })

    it('asserts long-text exception only for the flagged product (name ~90 chars, desc ~600 chars)', () => {
      const longText = demoCatalog.products.filter((p) => p.stress === 'long-text')
      expect(longText).toHaveLength(1)
      const p = longText[0]
      expect(p.name.length).toBeGreaterThanOrEqual(80)
      expect(p.name.length).toBeLessThanOrEqual(100)
      expect(p.description.length).toBeGreaterThanOrEqual(550)
      expect(p.description.length).toBeLessThanOrEqual(650)

      // All other products must be standard length
      for (const other of demoCatalog.products) {
        if (other.slug === p.slug) continue
        expect(other.name.length).toBeLessThan(80)
        expect(other.description.length).toBeLessThan(400)
      }
    })

    it('asserts Bengali only for the two flagged products with ASCII slugs', () => {
      const bengaliProds = demoCatalog.products.filter((p) => p.stress === 'bengali-locale')
      expect(bengaliProds).toHaveLength(2)
      const bengaliCharRegex = /[\u0980-\u09FF]/
      for (const p of bengaliProds) {
        expect(p.name).toMatch(bengaliCharRegex)
        expect(p.description).toMatch(bengaliCharRegex)
        expect(p.slug).toMatch(KEBAB_CASE_REGEX)
      }

      // Bengali only for the two flagged products
      const otherBengali = demoCatalog.products.filter(
        (p) =>
          p.stress !== 'bengali-locale' &&
          (bengaliCharRegex.test(p.name) || bengaliCharRegex.test(p.description))
      )
      expect(otherBengali).toHaveLength(0)
    })
  })

  describe('Content & Trademark Safety', () => {
    it('contains no third-party forbidden brand names in names or descriptions', () => {
      const allText = demoCatalog.products
        .map((p) => `${p.name} ${p.description}`)
        .join(' ')
        .toLowerCase()

      for (const brand of FORBIDDEN_BRANDS) {
        const regex = new RegExp(`\\b${brand}\\b`, 'i')
        expect(allText).not.toMatch(regex)
      }
    })

    it('has factual 2-3 sentence descriptions without medical or safety claims', () => {
      const bannedPatterns = [
        /\bcure\b/i,
        /\bmedical\b/i,
        /\bsterile\b/i,
        /\bsafe for infants\b/i,
        /\bfda approved\b/i,
      ]
      for (const p of demoCatalog.products) {
        const sentences =
          p.stress === 'bengali-locale'
            ? p.description.split('।').map((s) => s.trim()).filter(Boolean)
            : p.description.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean)

        expect(sentences.length).toBeGreaterThanOrEqual(2)
        expect(sentences.length).toBeLessThanOrEqual(3)

        for (const pattern of bannedPatterns) {
          expect(p.description).not.toMatch(pattern)
        }
      }
    })

    it('asserts no description contains prohibited compliance, brand, or unverified claims', () => {
      const forbiddenKeywords = [
        'fsc',
        'certified',
        'compliant',
        'non-toxic',
        'heidelberg',
        'acid-free',
        'waterproof',
        'lightfast',
        'eco-friendly',
        'sustainab',
        'organic',
        'catalog expansion',
        'upcoming',
      ]

      for (const p of demoCatalog.products) {
        const lower = p.description.toLowerCase()
        for (const kw of forbiddenKeywords) {
          expect(
            lower,
            `Product ${p.slug} contains prohibited keyword '${kw}'`
          ).not.toContain(kw)
        }
      }
    })
  })
})
