import type { Metadata } from 'next'
import { getAdminHeroSlides } from '@/lib/queries/hero-slides'
import { HeroSlidesManager } from '@/components/admin/hero-slides-manager'

export const metadata: Metadata = {
  title: 'Storefront Management',
}

export default async function AdminStorefrontPage() {
  const { slides, error } = await getAdminHeroSlides()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Storefront Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize homepage content, top hero slides, and promotional banners.
          </p>
        </div>
      </div>

      <HeroSlidesManager initialSlides={slides} dbError={error} />
    </div>
  )
}
