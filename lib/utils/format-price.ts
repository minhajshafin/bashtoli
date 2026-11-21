/**
 * lib/utils/format-price.ts
 *
 * Canonical currency formatter for Bashtoli.
 * Formats monetary amounts in English Taka currency: e.g. "Tk 70" or "Tk 1,200".
 * Uses Latin digits and the "Tk " prefix, compatible with all site fonts.
 */

export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return 'Tk 0'
  const num = typeof amount === 'number' ? amount : Number(amount)
  if (isNaN(num)) return 'Tk 0'
  return `Tk ${num.toLocaleString('en-US')}`
}

export function formatPriceRange(min: number | string, max: number | string): string {
  const minNum = typeof min === 'number' ? min : Number(min)
  const maxNum = typeof max === 'number' ? max : Number(max)
  if (isNaN(minNum) || isNaN(maxNum) || minNum === maxNum) {
    return formatPrice(minNum || maxNum || 0)
  }
  return `Tk ${minNum.toLocaleString('en-US')} – Tk ${maxNum.toLocaleString('en-US')}`
}
