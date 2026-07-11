'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProductOptionsAndValues } from '@/lib/actions/variants'

type OptionInput = {
  name: string
  valuesString: string // comma-separated values input
}

export function OptionManager({
  productId,
  initialOptions,
}: {
  productId: string
  initialOptions: { name: string; values: string[] }[]
}) {
  const router = useRouter()
  const [options, setOptions] = useState<OptionInput[]>(() =>
    initialOptions.map((opt) => ({
      name: opt.name,
      valuesString: opt.values.join(', '),
    }))
  )
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function addOptionDimension() {
    if (options.length >= 3) {
      alert('You can define at most 3 option dimensions (e.g. Size, Color, Material).')
      return
    }
    setOptions([...options, { name: '', valuesString: '' }])
    setSuccess(false)
  }

  function removeOptionDimension(index: number) {
    const next = [...options]
    next.splice(index, 1)
    setOptions(next)
    setSuccess(false)
  }

  function handleOptionChange(
    index: number,
    field: 'name' | 'valuesString',
    value: string
  ) {
    const next = [...options]
    next[index][field] = value
    setOptions(next)
    setSuccess(false)
  }

  async function handleSave() {
    setIsPending(true)
    setError(null)
    setSuccess(false)

    // Format options to match action requirements
    const formattedOptions = options
      .map((opt) => ({
        name: opt.name.trim(),
        values: opt.valuesString
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v !== ''),
      }))
      .filter((opt) => opt.name !== '' && opt.values.length > 0)

    const res = await saveProductOptionsAndValues(productId, formattedOptions)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setIsPending(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Product Options</h2>
        <p className="text-xs text-slate-500">
          Define option dimensions like Size or Color, and specify their values.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Options saved and variants synchronized successfully!
        </div>
      )}

      <div className="space-y-4">
        {options.map((opt, index) => (
          <div
            key={index}
            className="relative flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-start"
          >
            {/* Remove Option Button */}
            <button
              type="button"
              onClick={() => removeOptionDimension(index)}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 sm:relative sm:top-auto sm:right-auto sm:mt-8"
              aria-label="Remove option"
            >
              ✕
            </button>

            {/* Option Name */}
            <div className="flex-1 space-y-1">
              <label
                htmlFor={`opt-name-${index}`}
                className="text-xs font-semibold text-slate-600"
              >
                Option Name
              </label>
              <input
                id={`opt-name-${index}`}
                type="text"
                required
                value={opt.name}
                onChange={(e) =>
                  handleOptionChange(index, 'name', e.target.value)
                }
                placeholder="e.g. Size or Color"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Option Values (Comma Separated) */}
            <div className="flex-[2] space-y-1">
              <label
                htmlFor={`opt-values-${index}`}
                className="text-xs font-semibold text-slate-600"
              >
                Values (comma separated)
              </label>
              <input
                id={`opt-values-${index}`}
                type="text"
                required
                value={opt.valuesString}
                onChange={(e) =>
                  handleOptionChange(index, 'valuesString', e.target.value)
                }
                placeholder="e.g. S, M, L or Red, Blue"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        ))}

        {options.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
            No options defined. This product will have a single default variant.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={addOptionDimension}
            disabled={options.length >= 3}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Option Dimension
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Syncing...' : 'Save & Generate Variants'}
          </button>
        </div>
      </div>
    </div>
  )
}
