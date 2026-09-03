import type { Metadata } from 'next'
import { getAdminHeroSlides } from '@/lib/queries/hero-slides'
import { getAdminCategoryCollageData } from '@/lib/queries/category-collage'
import { HeroSlidesManager } from '@/components/admin/hero-slides-manager'
import { CategoryCollageManager } from '@/components/admin/category-collage-manager'

export const metadata: Metadata = {
  title: 'Storefront Management',
}

export default async function AdminStorefrontPage() {
  const [{ slides, error: heroError }, { featured, available, error: catError }] =
    await Promise.all([getAdminHeroSlides(), getAdminCategoryCollageData()])

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Storefront Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize homepage content, top hero slides, promotional banners, and category showcase.
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
