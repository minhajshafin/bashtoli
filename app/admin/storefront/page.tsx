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
      <div className="pb-5 border-b border-adm-border">
        <h1 className="admin-page-title text-adm-fg">Storefront Settings</h1>
      </div>

      <HeroSlidesManager initialSlides={slides} dbError={heroError} />

      <CategoryCollageManager
        initialFeatured={featured}
        initialAvailable={available}
      />
    </div>
  )
}
