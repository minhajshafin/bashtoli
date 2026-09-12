'use client'

import { createContext, useContext } from 'react'

export interface ProductStudioContextValue {
  hasVariantChanges: boolean
  setHasVariantChanges: (hasChanges: boolean) => void
  registerVariantSaveHandler: (handler: () => Promise<boolean>) => void
  resetSignal: number
}

export const ProductStudioContext = createContext<ProductStudioContextValue | null>(null)

export function useProductStudio() {
  return useContext(ProductStudioContext)
}
