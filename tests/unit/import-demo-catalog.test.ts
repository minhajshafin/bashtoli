import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import {
  generateProductSvg,
  generateCategorySvg,
  generateHeroSvg,
  generateWebpBuffer,
  parseArgs,
  buildDemoPlan,
  executeImport,
  executeReset,
  assertApplySafety,
  COLOR_PALETTE,
  type DemoCatalog,
} from '../../scripts/import-demo-catalog'

describe('Demo Catalog Importer & Placeholder Generator', () => {
  const catalogPath = path.resolve(process.cwd(), 'supabase/seed/demo-catalog.json')
  const catalogRaw = fs.readFileSync(catalogPath, 'utf8')
  const catalog = JSON.parse(catalogRaw) as DemoCatalog

  describe('1. JSON Validation Against DB Row Shape', () => {
    it('has catalog version 4 and valid top-level structure', () => {
      expect(catalog.version).toBe(4)
      expect(Array.isArray(catalog.categories)).toBe(true)
      expect(catalog.categories.length).toBe(8)
      expect(Array.isArray(catalog.products)).toBe(true)
      expect(catalog.products.length).toBe(50)
      expect(Array.isArray(catalog.hero_slides)).toBe(true)
      expect(catalog.hero_slides.length).toBe(3)
    })

    it('validates categories match public.categories table schema', () => {
      const slugs = new Set<string>()
      const featuredOrders = new Set<number>()

      for (const cat of catalog.categories) {
        expect(cat.name).toBeTruthy()
        expect(cat.slug).toBeTruthy()
        expect(typeof cat.sort_order).toBe('number')
        expect(typeof cat.is_featured).toBe('boolean')
        expect(typeof cat.featured_order).toBe('number')
        expect(COLOR_PALETTE[cat.color_token]).toBeDefined()

        // Uniqueness
        expect(slugs.has(cat.slug)).toBe(false)
        slugs.add(cat.slug)

        if (cat.is_featured) {
          expect(cat.featured_order).toBeGreaterThanOrEqual(1)
          expect(cat.featured_order).toBeLessThanOrEqual(7)
          expect(featuredOrders.has(cat.featured_order)).toBe(false)
          featuredOrders.add(cat.featured_order)
        }
      }

      expect(featuredOrders.size).toBe(7)
    })

    it('validates products and variants match public.products and public.product_variants schemas', () => {
      const productSlugs = new Set<string>()
      const variantSkus = new Set<string>()
      const categorySlugs = new Set(catalog.categories.map((c) => c.slug))

      for (const prod of catalog.products) {
        expect(prod.name).toBeTruthy()
        expect(prod.slug).toBeTruthy()
        expect(categorySlugs.has(prod.category_slug)).toBe(true)
        expect(typeof prod.base_price).toBe('number')
        expect(prod.base_price).toBeGreaterThan(0)
        expect(typeof prod.active).toBe('boolean')
        expect(typeof prod.featured).toBe('boolean')
        expect(typeof prod.image_slots).toBe('number')
        expect(prod.image_slots).toBeGreaterThanOrEqual(0)
        expect(prod.image_slots).toBeLessThanOrEqual(3)

        expect(productSlugs.has(prod.slug)).toBe(false)
        productSlugs.add(prod.slug)

        expect(Array.isArray(prod.variants)).toBe(true)
        expect(prod.variants.length).toBeGreaterThanOrEqual(1)

        for (const v of prod.variants) {
          expect(v.sku).toMatch(/^DEMO-[A-Z0-9-]+$/)
          expect(typeof v.price).toBe('number')
          expect(v.price).toBeGreaterThan(0)
          expect(typeof v.stock_qty).toBe('number')
          expect(v.stock_qty).toBeGreaterThanOrEqual(0)
          expect(typeof v.active).toBe('boolean')
          expect(typeof v.option_values).toBe('object')

          expect(variantSkus.has(v.sku)).toBe(false)
          variantSkus.add(v.sku)
        }
      }
    })

    it('validates hero slides match public.hero_slides table constraints', () => {
      const allowedColorPresets = new Set(['gold', 'forest', 'crimson', 'ocean', 'slate'])

      for (const slide of catalog.hero_slides) {
        expect(slide.badge_text).toBeTruthy()
        expect(allowedColorPresets.has(slide.badge_color_preset)).toBe(true)
        expect(slide.link_url).toMatch(/^\/products/)
        expect(slide.subtext).toBeTruthy()
        expect(typeof slide.sort_order).toBe('number')
        expect(typeof slide.active).toBe('boolean')
      }
    })
  })

  describe('2. Deterministic Image Generator & WebP Buffer Verification', () => {
    it('generates valid WebP product image buffers with exact 600x800 dimensions (<300KB)', async () => {
      for (const slot of [0, 1, 2]) {
        const svg = generateProductSvg({
          name: 'Classic Ruled School Notebook',
          sku: 'DEMO-NB-SCH-A5',
          colorToken: 'forest',
          slot,
          slotLabel: slot === 0 ? 'Cover' : slot === 1 ? 'Page Spread' : 'Binding Detail',
        })

        expect(svg).toContain('BASHTOLI ARCHIVE')
        expect(svg).toContain('DEMO-NB-SCH-A5')

        const buffer = await generateWebpBuffer(svg)
        expect(Buffer.isBuffer(buffer)).toBe(true)
        expect(buffer.length).toBeLessThan(300 * 1024) // < 300KB

        const metadata = await sharp(buffer).metadata()
        expect(metadata.format).toBe('webp')
        expect(metadata.width).toBe(600)
        expect(metadata.height).toBe(800)
      }
    })

    it('generates valid WebP category image buffer with exact 800x600 dimensions (<300KB)', async () => {
      const svg = generateCategorySvg({
        name: 'Notebooks & Journals',
        colorToken: 'forest',
      })

      expect(svg).toContain('CURATED COLLECTION')
      expect(svg).toContain('Notebooks &amp; Journals')

      const buffer = await generateWebpBuffer(svg)
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeLessThan(300 * 1024)

      const metadata = await sharp(buffer).metadata()
      expect(metadata.format).toBe('webp')
      expect(metadata.width).toBe(800)
      expect(metadata.height).toBe(600)
    })

    it('generates valid WebP hero slide image buffer with exact 800x1000 dimensions (<300KB)', async () => {
      const svg = generateHeroSvg({
        badgeText: 'Artisan Stationery',
        subtext: 'Hand-bound journals, jute diaries, and bamboo pens crafted with care.',
        badgeColorPreset: 'forest',
      })

      expect(svg).toContain('ARTISAN STATIONERY')
      expect(svg).toContain('BASHTOLI STOREFRONT')

      const buffer = await generateWebpBuffer(svg)
      expect(Buffer.isBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeLessThan(300 * 1024)

      const metadata = await sharp(buffer).metadata()
      expect(metadata.format).toBe('webp')
      expect(metadata.width).toBe(800)
      expect(metadata.height).toBe(1000)
    })
  })

  describe('3. Dry Run Safety & Zero Write Calls', () => {
    it('builds plan accurately without network calls', () => {
      const plan = buildDemoPlan(catalog)
      expect(plan.categoriesCount).toBe(8)
      expect(plan.heroSlidesCount).toBe(3)
      expect(plan.productsCount).toBe(50)
      expect(plan.variantsCount).toBeGreaterThanOrEqual(50)
      expect(plan.imagesToGenerate.categoryImages).toBe(8)
      expect(plan.imagesToGenerate.heroImages).toBe(3)
      expect(plan.imagesToGenerate.productImages).toBeGreaterThan(0)
      expect(plan.imagesToGenerate.total).toBe(
        plan.imagesToGenerate.categoryImages +
          plan.imagesToGenerate.heroImages +
          plan.imagesToGenerate.productImages
      )
    })

    it('executeImport in dry run makes zero database writes or storage uploads', async () => {
      const writeSpy = vi.fn()

      const mockSupabase = {
        from: vi.fn(() => ({
          upsert: writeSpy,
          insert: writeSpy,
          update: writeSpy,
          delete: writeSpy,
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: vi.fn(), single: vi.fn() })),
          })),
        })),
        storage: {
          from: vi.fn(() => ({
            upload: writeSpy,
            remove: writeSpy,
            list: vi.fn(),
          })),
        },
      } as unknown as SupabaseClient

      const result = await executeImport({
        supabase: mockSupabase,
        catalog,
        supabaseUrl: 'https://staging.supabase.co',
        dryRun: true,
      })

      expect(result.applied).toBe(false)
      expect(writeSpy).not.toHaveBeenCalled()
      expect(mockSupabase.from).not.toHaveBeenCalled()
      expect(mockSupabase.storage.from).not.toHaveBeenCalled()
    })

    it('executeReset in dry run makes zero database writes or storage removals', async () => {
      const writeSpy = vi.fn()

      const mockSupabase = {
        from: vi.fn(() => ({
          update: writeSpy,
          delete: writeSpy,
          select: vi.fn(),
        })),
        storage: {
          from: vi.fn(() => ({
            remove: writeSpy,
            list: vi.fn(),
          })),
        },
      } as unknown as SupabaseClient

      const result = await executeReset({
        supabase: mockSupabase,
        catalog,
        dryRun: true,
      })

      expect(result.applied).toBe(false)
      expect(writeSpy).not.toHaveBeenCalled()
      expect(mockSupabase.from).not.toHaveBeenCalled()
      expect(mockSupabase.storage.from).not.toHaveBeenCalled()
    })
  })

  describe('4. CLI Arguments & Safety Flags', () => {
    it('defaults to dry run when no arguments provided', () => {
      const args = parseArgs([])
      expect(args.apply).toBe(false)
      expect(args.confirmHost).toBeNull()
      expect(args.resetDemo).toBe(false)
    })

    it('parses --apply and --confirm-host properly', () => {
      const args = parseArgs(['--apply', '--confirm-host=staging-bashtoli.supabase.co'])
      expect(args.apply).toBe(true)
      expect(args.confirmHost).toBe('staging-bashtoli.supabase.co')
      expect(args.resetDemo).toBe(false)
    })

    it('parses --reset-demo properly', () => {
      const args = parseArgs(['--reset-demo', '--apply', '--confirm-host=test.supabase.co'])
      expect(args.apply).toBe(true)
      expect(args.confirmHost).toBe('test.supabase.co')
      expect(args.resetDemo).toBe(true)
    })

    it('throws when --apply is provided without --confirm-host', () => {
      expect(() =>
        assertApplySafety({
          apply: true,
          confirmHost: null,
          expectedHost: 'staging-project.supabase.co',
        })
      ).toThrow(/--apply requires --confirm-host=<hostname>/)
    })

    it('throws when --confirm-host does not match expected project hostname', () => {
      expect(() =>
        assertApplySafety({
          apply: true,
          confirmHost: 'wrong-host.supabase.co',
          expectedHost: 'staging-project.supabase.co',
        })
      ).toThrow(/does not match expected project hostname/)
    })

    it('succeeds when --apply and matching --confirm-host are provided', () => {
      expect(() =>
        assertApplySafety({
          apply: true,
          confirmHost: 'staging-project.supabase.co',
          expectedHost: 'staging-project.supabase.co',
        })
      ).not.toThrow()
    })
  })

  describe('5. Reset Demo Targets Only Demo Items & Respects Order History', () => {
    it('soft-deletes products with order items and hard-deletes products without order items', async () => {
      const updatedIds: string[] = []
      const deletedIds: string[] = []

      const mockProducts = [
        { id: 'prod-ordered-1', slug: catalog.products[0].slug },
        { id: 'prod-unorder-2', slug: catalog.products[1].slug },
      ]

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'products') {
            return {
              select: vi.fn(() => ({
                in: vi.fn(async () => ({ data: mockProducts, error: null })),
              })),
              update: vi.fn(() => ({
                eq: vi.fn(async (_col: string, val: string) => {
                  updatedIds.push(val)
                  return { error: null }
                }),
              })),
              delete: vi.fn(() => ({
                eq: vi.fn(async (_col: string, val: string) => {
                  deletedIds.push(val)
                  return { error: null }
                }),
              })),
            }
          }
          if (table === 'order_items') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(async (_col: string, val: string) => {
                  if (val === 'prod-ordered-1') return { count: 2, error: null }
                  return { count: 0, error: null }
                }),
              })),
            }
          }
          if (table === 'product_variants') {
            return {
              update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
              delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
            }
          }
          if (table === 'categories') {
            return {
              delete: vi.fn(() => ({ in: vi.fn(async () => ({ error: null })) })),
            }
          }
          if (table === 'hero_slides') {
            return {
              select: vi.fn(async () => ({
                data: [{ id: 'slide-1', alt_text: 'DEMO: Artisan Stationery', image_url: 'demo/hero/slide.webp' }],
              })),
              delete: vi.fn(() => ({ in: vi.fn(async () => ({ error: null })) })),
            }
          }
          return {}
        }),
        storage: {
          from: vi.fn(() => ({
            list: vi.fn(async () => ({ data: [{ name: 'img1.webp' }] })),
            remove: vi.fn(async () => ({ error: null })),
          })),
        },
      } as unknown as SupabaseClient

      const result = await executeReset({
        supabase: mockSupabase,
        catalog,
        dryRun: false,
      })

      expect(result.applied).toBe(true)
      expect(result.softDeleted).toBe(1)
      expect(result.hardDeleted).toBe(1)
      expect(updatedIds).toContain('prod-ordered-1')
      expect(deletedIds).toContain('prod-unorder-2')
    })
  })
})
