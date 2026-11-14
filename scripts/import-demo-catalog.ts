import fs from 'node:fs'
import path from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { assertScriptTarget } from './_guard'

// ============================================================================
// Types & Palette Configuration
// ============================================================================

export interface ColorScheme {
  bg: string
  text: string
  accent: string
}

export const COLOR_PALETTE: Record<string, ColorScheme> = {
  forest: { bg: '#1e3d2c', text: '#f6f0e4', accent: '#c4a265' },
  gold: { bg: '#c4a265', text: '#102218', accent: '#1e3d2c' },
  cream: { bg: '#f6f0e4', text: '#102218', accent: '#386b4f' },
  terracotta: { bg: '#8f3621', text: '#f6f0e4', accent: '#c4a265' },
  ink: { bg: '#102218', text: '#f6f0e4', accent: '#c4a265' },
  moss: { bg: '#386b4f', text: '#f6f0e4', accent: '#f6f0e4' },
  ocean: { bg: '#3b7097', text: '#f6f0e4', accent: '#f6f0e4' },
  slate: { bg: '#5c6460', text: '#f6f0e4', accent: '#f6f0e4' },
}

export interface DemoCategory {
  name: string
  slug: string
  sort_order: number
  is_featured: boolean
  featured_order: number
  color_token: string
  description: string
}

export interface DemoHeroSlide {
  badge_text: string
  badge_color_preset: string
  link_url: string
  subtext: string
  sort_order: number
  active: boolean
}

export interface DemoVariant {
  sku: string
  price: number
  stock_qty: number
  active: boolean
  option_values: Record<string, string>
}

export interface DemoOption {
  name: string
  values: string[]
}

export interface DemoProduct {
  name: string
  slug: string
  category_slug: string
  item_type: string
  description: string
  active: boolean
  featured: boolean
  image_label: string
  image_color: string
  image_slots: number
  image_labels: string[]
  options: DemoOption[]
  variants: DemoVariant[]
  base_price: number
}

export interface DemoCatalog {
  version: number
  description: string
  categories: DemoCategory[]
  hero_slides: DemoHeroSlide[]
  products: DemoProduct[]
}

export interface ParsedArgs {
  apply: boolean
  confirmHost: string | null
  resetDemo: boolean
}

// ============================================================================
// SVG & WebP Generation Helpers
// ============================================================================

export function escapeXml(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function wrapText(text: string, maxChars = 22): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if (!current) {
      current = w
    } else if ((current + ' ' + w).length <= maxChars) {
      current += ' ' + w
    } else {
      lines.push(current)
      current = w
    }
  }
  if (current) lines.push(current)
  return lines
}

export function generateProductSvg({
  name,
  sku,
  colorToken,
  slot,
  slotLabel,
}: {
  name: string
  sku: string
  colorToken: string
  slot: number
  slotLabel?: string
}): string {
  const width = 600
  const height = 800
  const palette = COLOR_PALETTE[colorToken] || COLOR_PALETTE.forest

  const lines = wrapText(name, 22)
  const titleTspans = lines
    .map(
      (line, i) =>
        `<tspan x="300" dy="${i === 0 ? 0 : 32}">${escapeXml(line)}</tspan>`
    )
    .join('')

  let perspectiveBadge = 'PRIMARY VIEW'
  if (slot === 1) perspectiveBadge = 'DETAIL PERSPECTIVE'
  if (slot === 2) perspectiveBadge = 'MATERIAL FOCUS'
  if (slotLabel) perspectiveBadge = slotLabel.toUpperCase()

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${palette.bg}"/>
  <rect x="40" y="40" width="520" height="720" rx="20" fill="none" stroke="${palette.accent}" stroke-width="1.5" opacity="0.3"/>
  <circle cx="300" cy="310" r="170" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.25"/>

  <!-- Minimalist Stationery Emblem -->
  <g transform="translate(260, 240)" opacity="0.85">
    <rect x="0" y="0" width="80" height="100" rx="6" fill="none" stroke="${palette.text}" stroke-width="2"/>
    <line x1="16" y1="28" x2="64" y2="28" stroke="${palette.accent}" stroke-width="2"/>
    <line x1="16" y1="46" x2="64" y2="46" stroke="${palette.accent}" stroke-width="2"/>
    <line x1="16" y1="64" x2="48" y2="64" stroke="${palette.accent}" stroke-width="2"/>
    ${
      slot === 1
        ? `<circle cx="60" cy="20" r="14" fill="${palette.accent}" opacity="0.9"/>
           <line x1="53" y1="20" x2="67" y2="20" stroke="${palette.bg}" stroke-width="2"/>
           <line x1="60" y1="13" x2="60" y2="27" stroke="${palette.bg}" stroke-width="2"/>`
        : slot === 2
        ? `<rect x="44" y="66" width="26" height="24" rx="3" fill="${palette.accent}" opacity="0.9"/>`
        : ''
    }
  </g>

  <!-- Brand Tracking Header -->
  <text x="300" y="105" text-anchor="middle" fill="${palette.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="12" letter-spacing="4" font-weight="700">BASHTOLI ARCHIVE</text>

  <!-- Title & Perspective -->
  <text x="300" y="450" text-anchor="middle" fill="${palette.text}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">
    ${titleTspans}
  </text>
  <text x="300" y="550" text-anchor="middle" fill="${palette.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="12" letter-spacing="3" font-weight="600">${escapeXml(perspectiveBadge)}</text>

  <!-- SKU Badge -->
  <rect x="180" y="630" width="240" height="36" rx="18" fill="#102218" stroke="${palette.accent}" stroke-width="1" opacity="0.85"/>
  <text x="300" y="653" text-anchor="middle" fill="#f6f0e4" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" letter-spacing="1.5">${escapeXml(sku)}</text>
</svg>
`.trim()
}

export function generateCategorySvg({
  name,
  colorToken,
}: {
  name: string
  colorToken: string
}): string {
  const width = 800
  const height = 600
  const palette = COLOR_PALETTE[colorToken] || COLOR_PALETTE.forest

  const lines = wrapText(name, 20)
  const titleTspans = lines
    .map(
      (line, i) =>
        `<tspan x="400" dy="${i === 0 ? 0 : 38}">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${palette.bg}"/>
  <rect x="40" y="40" width="720" height="520" rx="16" fill="none" stroke="${palette.accent}" stroke-width="1.5" opacity="0.35"/>
  <rect x="52" y="52" width="696" height="496" rx="12" fill="none" stroke="${palette.accent}" stroke-width="0.8" stroke-dasharray="8 8" opacity="0.25"/>

  <!-- Geometric Emblem -->
  <g transform="translate(360, 160)" opacity="0.85">
    <circle cx="40" cy="40" r="36" fill="none" stroke="${palette.accent}" stroke-width="2"/>
    <path d="M 40 16 L 40 64 M 16 40 L 64 40" stroke="${palette.text}" stroke-width="2"/>
  </g>

  <!-- Category Title -->
  <text x="400" y="115" text-anchor="middle" fill="${palette.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="12" letter-spacing="4" font-weight="700">CURATED COLLECTION</text>
  <text x="400" y="320" text-anchor="middle" fill="${palette.text}" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="700">
    ${titleTspans}
  </text>
  <text x="400" y="450" text-anchor="middle" fill="${palette.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="13" letter-spacing="3" font-weight="600">EXPLORE ARCHIVE</text>
</svg>
`.trim()
}

export function generateHeroSvg({
  badgeText,
  subtext,
  badgeColorPreset,
}: {
  badgeText: string
  subtext: string
  badgeColorPreset: string
}): string {
  const width = 800
  const height = 1000
  const palette = COLOR_PALETTE[badgeColorPreset] || COLOR_PALETTE.gold

  const subtextLines = wrapText(subtext, 28)
  const subtextTspans = subtextLines
    .map(
      (line, i) =>
        `<tspan x="400" dy="${i === 0 ? 0 : 28}">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${palette.bg}"/>
  <rect x="40" y="40" width="720" height="920" rx="24" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.35"/>
  <circle cx="400" cy="380" r="220" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.3"/>

  <!-- Arch motif -->
  <path d="M 280 480 A 120 120 0 0 1 520 480 L 520 540 L 280 540 Z" fill="none" stroke="${palette.text}" stroke-width="2" opacity="0.7"/>

  <!-- Badge Pill -->
  <rect x="250" y="140" width="300" height="44" rx="22" fill="#102218" stroke="${palette.accent}" stroke-width="1.5" opacity="0.9"/>
  <text x="400" y="168" text-anchor="middle" fill="#f6f0e4" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="2">${escapeXml(badgeText.toUpperCase())}</text>

  <!-- Editorial Subtext -->
  <text x="400" y="650" text-anchor="middle" fill="${palette.text}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500">
    ${subtextTspans}
  </text>
  <text x="400" y="800" text-anchor="middle" fill="${palette.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="14" letter-spacing="3" font-weight="700">BASHTOLI STOREFRONT</text>
</svg>
`.trim()
}

export async function generateWebpBuffer(svgContent: string): Promise<Buffer> {
  return sharp(Buffer.from(svgContent)).webp({ quality: 80 }).toBuffer()
}

// ============================================================================
// CLI Arguments & Plan Builder
// ============================================================================

export function assertApplySafety({
  apply,
  confirmHost,
  expectedHost,
}: {
  apply: boolean
  confirmHost: string | null
  expectedHost: string
}): void {
  if (apply) {
    if (!confirmHost) {
      throw new Error(
        `Safety check failed: --apply requires --confirm-host=<hostname>. Expected: --confirm-host=${expectedHost}`
      )
    }
    if (confirmHost !== expectedHost) {
      throw new Error(
        `Safety check failed: Provided --confirm-host (${confirmHost}) does not match expected project hostname (${expectedHost}). Execution aborted.`
      )
    }
  }
}

export function parseArgs(argv: string[]): ParsedArgs {
  let apply = false
  let confirmHost: string | null = null
  let resetDemo = false

  for (const arg of argv) {
    if (arg === '--apply') {
      apply = true
    } else if (arg.startsWith('--confirm-host=')) {
      confirmHost = arg.substring('--confirm-host='.length).trim()
    } else if (arg === '--reset-demo') {
      resetDemo = true
    }
  }

  return { apply, confirmHost, resetDemo }
}

export interface DemoPlan {
  categoriesCount: number
  productsCount: number
  variantsCount: number
  heroSlidesCount: number
  imagesToGenerate: {
    categoryImages: number
    productImages: number
    heroImages: number
    total: number
  }
  sampleStoragePaths: string[]
}

export function buildDemoPlan(catalog: DemoCatalog): DemoPlan {
  const categoryImages = catalog.categories.length
  const heroImages = catalog.hero_slides.length
  let productImages = 0
  let variantsCount = 0

  const samplePaths: string[] = []

  for (const cat of catalog.categories) {
    if (samplePaths.length < 3) {
      samplePaths.push(`demo/categories/${cat.slug}.webp`)
    }
  }

  for (const slide of catalog.hero_slides) {
    const slideSlug = slide.badge_text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    if (samplePaths.length < 5) {
      samplePaths.push(`demo/hero/${slideSlug}.webp`)
    }
  }

  for (const prod of catalog.products) {
    variantsCount += prod.variants.length
    productImages += prod.image_slots
    if (prod.image_slots > 0 && samplePaths.length < 8) {
      samplePaths.push(`demo/products/${prod.slug}-0.webp`)
    }
  }

  return {
    categoriesCount: catalog.categories.length,
    productsCount: catalog.products.length,
    variantsCount,
    heroSlidesCount: catalog.hero_slides.length,
    imagesToGenerate: {
      categoryImages,
      productImages,
      heroImages,
      total: categoryImages + productImages + heroImages,
    },
    sampleStoragePaths: samplePaths,
  }
}

// ============================================================================
// Importer & Reset Implementations
// ============================================================================

export async function executeImport({
  supabase,
  catalog,
  supabaseUrl,
  dryRun,
}: {
  supabase: SupabaseClient
  catalog: DemoCatalog
  supabaseUrl: string
  dryRun: boolean
}) {
  const plan = buildDemoPlan(catalog)

  if (dryRun) {
    console.log('[DRY RUN] Plan summary:')
    console.log(`- Categories to upsert: ${plan.categoriesCount}`)
    console.log(`- Hero slides to upsert: ${plan.heroSlidesCount}`)
    console.log(`- Products to upsert: ${plan.productsCount}`)
    console.log(`- Variants to reconcile: ${plan.variantsCount}`)
    console.log(`- Images to generate: ${plan.imagesToGenerate.total} (${plan.imagesToGenerate.categoryImages} categories, ${plan.imagesToGenerate.heroImages} hero, ${plan.imagesToGenerate.productImages} products)`)
    console.log('Sample storage paths:')
    for (const p of plan.sampleStoragePaths) {
      console.log(`  ${p}`)
    }
    console.log('[DRY RUN] Completed. Zero database or storage writes performed.')
    return { applied: false, plan }
  }

  console.log('[APPLY] Starting demo catalog import...')

  // 1. Process Categories
  console.log(`[Categories] Processing ${catalog.categories.length} categories...`)
  const categoryIdMap = new Map<string, string>()

  for (const cat of catalog.categories) {
    const storagePath = `demo/categories/${cat.slug}.webp`
    const svg = generateCategorySvg({ name: cat.name, colorToken: cat.color_token })
    const buffer = await generateWebpBuffer(svg)

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, { contentType: 'image/webp', upsert: true })

    if (uploadError) {
      console.warn(`[Categories] Storage upload warning for ${storagePath}: ${uploadError.message}`)
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`

    const { data: upsertedCat, error: catError } = await supabase
      .from('categories')
      .upsert(
        {
          name: cat.name,
          slug: cat.slug,
          sort_order: cat.sort_order,
          is_featured: cat.is_featured,
          featured_order: cat.featured_order,
          image_url: imageUrl,
        },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single()

    if (catError || !upsertedCat) {
      throw new Error(`Failed to upsert category ${cat.slug}: ${catError?.message}`)
    }

    categoryIdMap.set(cat.slug, upsertedCat.id)
  }

  // 2. Process Hero Slides
  console.log(`[Hero Slides] Processing ${catalog.hero_slides.length} slides...`)
  for (const slide of catalog.hero_slides) {
    const slideSlug = slide.badge_text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const storagePath = `demo/hero/${slideSlug}.webp`
    const svg = generateHeroSvg({
      badgeText: slide.badge_text,
      subtext: slide.subtext,
      badgeColorPreset: slide.badge_color_preset,
    })
    const buffer = await generateWebpBuffer(svg)

    const { error: heroUploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, { contentType: 'image/webp', upsert: true })

    if (heroUploadError) {
      console.warn(`[Hero] Storage upload warning for ${storagePath}: ${heroUploadError.message}`)
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
    const altText = `DEMO: ${slide.badge_text}`

    // Check if slide already exists
    const { data: existingSlide } = await supabase
      .from('hero_slides')
      .select('id')
      .eq('alt_text', altText)
      .maybeSingle()

    if (existingSlide) {
      await supabase
        .from('hero_slides')
        .update({
          image_url: imageUrl,
          badge_text: slide.badge_text,
          badge_color_preset: slide.badge_color_preset,
          link_url: slide.link_url,
          subtext: slide.subtext,
          sort_order: slide.sort_order,
          active: slide.active,
        })
        .eq('id', existingSlide.id)
    } else {
      await supabase.from('hero_slides').insert({
        image_url: imageUrl,
        alt_text: altText,
        badge_text: slide.badge_text,
        badge_color_preset: slide.badge_color_preset,
        link_url: slide.link_url,
        subtext: slide.subtext,
        sort_order: slide.sort_order,
        active: slide.active,
      })
    }
  }

  // 3. Process Products
  console.log(`[Products] Processing ${catalog.products.length} products...`)
  let succeededProducts = 0
  let failedProducts = 0

  for (const prod of catalog.products) {
    try {
      const categoryId = categoryIdMap.get(prod.category_slug)
      if (!categoryId) {
        throw new Error(`Category ${prod.category_slug} not found in map`)
      }

      // 3.1 Upsert product base record
      const { data: productRow, error: prodErr } = await supabase
        .from('products')
        .upsert(
          {
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            category_id: categoryId,
            base_price: prod.base_price,
            active: prod.active,
            featured: prod.featured,
          },
          { onConflict: 'slug' }
        )
        .select('id')
        .single()

      if (prodErr || !productRow) {
        throw new Error(`Failed to upsert product ${prod.slug}: ${prodErr?.message}`)
      }

      const productId = productRow.id

      // 3.2 Product Images
      await supabase.from('product_images').delete().eq('product_id', productId)

      if (prod.image_slots > 0) {
        const imageInserts = []
        for (let slot = 0; slot < prod.image_slots; slot++) {
          const storagePath = `demo/products/${prod.slug}-${slot}.webp`
          const slotLabel = prod.image_labels?.[slot] || (slot === 0 ? 'Primary' : `Detail ${slot}`)
          const primarySku = prod.variants[0]?.sku || 'DEMO-SKU'

          const svg = generateProductSvg({
            name: prod.name,
            sku: primarySku,
            colorToken: prod.image_color,
            slot,
            slotLabel,
          })
          const buffer = await generateWebpBuffer(svg)

          await supabase.storage
            .from('product-images')
            .upload(storagePath, buffer, { contentType: 'image/webp', upsert: true })

          const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
          imageInserts.push({
            product_id: productId,
            url: imageUrl,
            alt_text: prod.name,
            sort_order: slot,
          })
        }

        if (imageInserts.length > 0) {
          const { error: imgErr } = await supabase.from('product_images').insert(imageInserts)
          if (imgErr) {
            console.warn(`[Images] Warning inserting product images for ${prod.slug}: ${imgErr.message}`)
          }
        }
      }

      // 3.3 Replace Options & Option Values
      await supabase.from('product_options').delete().eq('product_id', productId)

      if (prod.options && prod.options.length > 0) {
        for (let oIdx = 0; oIdx < prod.options.length; oIdx++) {
          const opt = prod.options[oIdx]
          const { data: optionRow, error: optErr } = await supabase
            .from('product_options')
            .insert({
              product_id: productId,
              name: opt.name.trim(),
              sort_order: oIdx,
            })
            .select('id')
            .single()

          if (optErr || !optionRow) {
            throw new Error(`Failed to insert option ${opt.name} for ${prod.slug}: ${optErr?.message}`)
          }

          const valueRows = opt.values.map((val, vIdx) => ({
            option_id: optionRow.id,
            value: val.trim(),
            sort_order: vIdx,
          }))

          const { error: valErr } = await supabase.from('product_option_values').insert(valueRows)
          if (valErr) {
            throw new Error(`Failed to insert option values for ${opt.name}: ${valErr.message}`)
          }
        }
      }

      // 3.4 Reconcile Variants
      const { data: existingVariants, error: fetchVarErr } = await supabase
        .from('product_variants')
        .select('id, sku, active, option_values, price, stock_qty')
        .eq('product_id', productId)

      if (fetchVarErr) {
        throw new Error(`Failed to fetch existing variants: ${fetchVarErr.message}`)
      }

      const existingBySku = new Map<string, { id: string; active: boolean }>()
      for (const ev of existingVariants || []) {
        if (ev.sku) existingBySku.set(ev.sku, ev)
      }

      const catalogSkuSet = new Set<string>()

      for (const v of prod.variants) {
        catalogSkuSet.add(v.sku)
        const existing = existingBySku.get(v.sku)

        if (existing) {
          const { error: varUpdateErr } = await supabase
            .from('product_variants')
            .update({
              price: v.price,
              stock_qty: v.stock_qty,
              active: v.active,
              option_values: v.option_values,
            })
            .eq('id', existing.id)

          if (varUpdateErr) {
            throw new Error(`Failed to update variant ${v.sku}: ${varUpdateErr.message}`)
          }
        } else {
          const { error: varInsertErr } = await supabase.from('product_variants').insert({
            product_id: productId,
            sku: v.sku,
            price: v.price,
            stock_qty: v.stock_qty,
            active: v.active,
            option_values: v.option_values,
          })

          if (varInsertErr) {
            throw new Error(`Failed to insert variant ${v.sku}: ${varInsertErr.message}`)
          }
        }
      }

      // Deactivate any DEMO- variants no longer present in catalog
      for (const ev of existingVariants || []) {
        if (ev.sku?.startsWith('DEMO-') && !catalogSkuSet.has(ev.sku) && ev.active) {
          await supabase.from('product_variants').update({ active: false }).eq('id', ev.id)
        }
      }

      succeededProducts++
    } catch (prodError) {
      failedProducts++
      console.error(`[Product Error] Error processing ${prod.slug}:`, prodError)
    }
  }

  console.log(`[Import Complete] Succeeded products: ${succeededProducts}, Failed products: ${failedProducts}`)
  return { applied: true, plan, succeededProducts, failedProducts }
}

export async function executeReset({
  supabase,
  catalog,
  dryRun,
}: {
  supabase: SupabaseClient
  catalog: DemoCatalog
  dryRun: boolean
}) {
  const demoSlugs = catalog.products.map((p) => p.slug)
  const demoCategorySlugs = catalog.categories.map((c) => c.slug)

  if (dryRun) {
    console.log('[DRY RUN] Reset Demo mode:')
    console.log(`- Would check ${demoSlugs.length} demo products for order history.`)
    console.log('- If ordered: soft-delete (active = false). If not ordered: delete variants and product.')
    console.log(`- Would delete up to ${demoCategorySlugs.length} demo categories (if unreferenced).`)
    console.log('- Would delete hero slides with alt_text starting with "DEMO:".')
    console.log('- Would clean up storage objects in product-images under demo/.')
    return { applied: false }
  }

  console.log('[RESET] Starting demo catalog reset...')

  // 1. Find demo products
  const { data: demoProducts, error: fetchErr } = await supabase
    .from('products')
    .select('id, slug')
    .in('slug', demoSlugs)

  if (fetchErr) {
    throw new Error(`Failed to query demo products: ${fetchErr.message}`)
  }

  let softDeleted = 0
  let hardDeleted = 0

  for (const prod of demoProducts || []) {
    // Check if referenced in order_items
    const { count, error: countErr } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', prod.id)

    if (countErr) {
      console.warn(`[Reset] Warning checking order_items for ${prod.slug}: ${countErr.message}`)
    }

    if (count && count > 0) {
      // Soft-delete
      await supabase.from('products').update({ active: false }).eq('id', prod.id)
      await supabase.from('product_variants').update({ active: false }).eq('product_id', prod.id)
      softDeleted++
      console.log(`[Reset] Product ${prod.slug} has ${count} order item(s). Deactivated (soft-deleted).`)
    } else {
      // Hard-delete: first delete variants (FK RESTRICT on products), then product
      await supabase.from('product_variants').delete().eq('product_id', prod.id)
      await supabase.from('products').delete().eq('id', prod.id)
      hardDeleted++
      console.log(`[Reset] Product ${prod.slug} hard-deleted.`)
    }
  }

  // 2. Remove demo categories
  const { error: catDelErr } = await supabase
    .from('categories')
    .delete()
    .in('slug', demoCategorySlugs)

  if (catDelErr) {
    console.warn(`[Reset] Warning deleting demo categories: ${catDelErr.message}`)
  }

  // 3. Remove demo hero slides
  const { data: heroSlides } = await supabase
    .from('hero_slides')
    .select('id, alt_text, image_url')

  const demoSlideIds = (heroSlides || [])
    .filter((s) => s.alt_text?.startsWith('DEMO:') || s.image_url?.includes('/demo/hero/'))
    .map((s) => s.id)

  if (demoSlideIds.length > 0) {
    await supabase.from('hero_slides').delete().in('id', demoSlideIds)
    console.log(`[Reset] Deleted ${demoSlideIds.length} demo hero slide(s).`)
  }

  // 4. Remove storage objects under demo/
  for (const folder of ['demo/products', 'demo/categories', 'demo/hero']) {
    try {
      const { data: files } = await supabase.storage.from('product-images').list(folder, { limit: 1000 })
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${folder}/${f.name}`)
        await supabase.storage.from('product-images').remove(filePaths)
        console.log(`[Reset] Removed ${filePaths.length} storage files in ${folder}`)
      }
    } catch (storageErr) {
      console.warn(`[Reset] Storage cleanup warning in ${folder}:`, storageErr)
    }
  }

  console.log(`[Reset Complete] Soft-deleted: ${softDeleted}, Hard-deleted: ${hardDeleted}`)
  return { applied: true, softDeleted, hardDeleted }
}

// ============================================================================
// Main Execution Entrypoint
// ============================================================================

export async function main() {
  assertScriptTarget()

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Safety check failed: Demo catalog importer must NEVER run in production.')
  }

  const { apply, confirmHost, resetDemo } = parseArgs(process.argv.slice(2))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !secretKey) {
    throw new Error('Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY) are missing.')
  }

  let expectedHost: string
  try {
    expectedHost = new URL(supabaseUrl).hostname
  } catch {
    expectedHost = supabaseUrl
  }

  assertApplySafety({ apply, confirmHost, expectedHost })

  const catalogPath = path.resolve(process.cwd(), 'supabase/seed/demo-catalog.json')
  const catalogRaw = fs.readFileSync(catalogPath, 'utf8')
  const catalog = JSON.parse(catalogRaw) as DemoCatalog

  if (catalog.version !== 4) {
    throw new Error(`Expected demo-catalog.json version 4, got version ${catalog.version}`)
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (resetDemo) {
    await executeReset({ supabase, catalog, dryRun: !apply })
  } else {
    await executeImport({ supabase, catalog, supabaseUrl, dryRun: !apply })
  }
}

// Run if called directly
const isDirectRun =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  (process.argv[1].endsWith('import-demo-catalog.ts') || process.argv[1].endsWith('import-demo-catalog.js'))

if (isDirectRun) {
  main().catch((err) => {
    console.error('[FATAL]', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
