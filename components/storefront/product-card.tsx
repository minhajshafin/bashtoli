import Image from 'next/image'
import Link from 'next/link'
import type { ProductWithDetails } from '@/lib/queries/products'

interface ProductCardProps {
  product: ProductWithDetails
}

export function ProductCard({ product }: ProductCardProps) {
  // Filter only active variants (though query already filters them, double safety is good)
  const activeVariants = product.product_variants.filter((v) => v.active)

  // Compute lowest variant price, falling back to base_price
  const lowestPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.price))
      : product.base_price

  // Check if all variants are out of stock
  const isSoldOut =
    activeVariants.length > 0 && activeVariants.every((v) => v.stock_qty === 0)

  // Primary image is the first sorted image (or fallback)
  const primaryImage = product.product_images?.[0]
  const imageUrl = primaryImage?.url || null
  const altText = primaryImage?.alt_text || product.name

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      {/* Image Gallery Wrap */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* High-quality placeholder image with SVG pattern */
          <div className="flex h-full w-full items-center justify-center bg-stone-100/60 dark:bg-zinc-900 text-zinc-400">
            <svg
              className="h-12 w-12 stroke-[1.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Sold out overlay/badge */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="rounded-full bg-rose-600 px-3.5 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-md animate-pulse">
              Sold Out
            </span>
          </div>
        )}

        {/* Category badge (top left) */}
        {product.categories && (
          <span className="absolute top-3 left-3 rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-[2px] dark:bg-zinc-800/90">
            {product.categories.name}
          </span>
        )}
      </div>

      {/* Product Card Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1 transition-colors group-hover:text-amber-600 dark:text-zinc-50">
          {product.name}
        </h3>

        {/* Description snapshot */}
        {product.description && (
          <p className="mt-1 text-xs text-zinc-500 line-clamp-2 dark:text-zinc-400">
            {product.description}
          </p>
        )}

        {/* Bottom bar: price */}
        <div className="mt-auto pt-3 flex items-baseline justify-between">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            ৳{lowestPrice.toLocaleString()}
            {activeVariants.length > 1 && (
              <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400 ml-1">
                onwards
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
