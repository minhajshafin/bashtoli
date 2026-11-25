import type { Metadata } from 'next'
import { connection } from 'next/server'
import { getAdminHeroSlides } from '@/lib/queries/hero-slides'
import { getAdminCategoryCollageData } from '@/lib/queries/category-collage'
import { HeroSlidesManager } from '@/components/admin/hero-slides-manager'
import { CategoryCollageManager } from '@/components/admin/category-collage-manager'

export const metadata: Metadata = {
  title: 'Storefront Management',
}

export const instant = false

export default async function AdminStorefrontPage() {
  await connection()
  const [{ slides, error: heroError }, { featured, available }] =
    await Promise.all([getAdminHeroSlides(), getAdminCategoryCollageData()])

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-paper-300">
        <div className="space-y-1.5">
          <p className="admin-kicker text-ink-500">04 / Visual Merchandising</p>
          <h1 className="admin-page-title text-ink-950">Storefront Settings</h1>
          <p className="text-sm text-ink-600">
            Customize homepage content, hero carousel slides, promotional badges, and category collage slots.
          </p>
        </div>
      </div>

      <HeroSlidesManager initialSlides={slides} dbError={heroError} />

      <CategoryCollageManager
        initialFeatured={featured}
        initialAvailable={available}
      />
    </div>
  )
}
