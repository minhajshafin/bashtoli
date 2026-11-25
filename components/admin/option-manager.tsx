'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { saveProductOptionsAndValues } from '@/lib/actions/variants'
import { useToast } from '@/components/ui/toast'

type OptionInput = {
  name: string
  valuesString: string
}

export function OptionManager({
  productId,
  initialOptions,
}: {
  productId: string
  initialOptions: { name: string; values: string[] }[]
}) {
  const router = useRouter()
  const { toast } = useToast()
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
      toast('You can define at most 3 option dimensions (e.g. Size, Color, Material).', 'info')
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
    <div className="rounded-2xl border border-adm-border bg-adm-surface p-6 shadow-subtle">
      <div className="mb-4">
        <h2 className="admin-section-title text-adm-fg">Options</h2>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-adm-danger-border bg-adm-danger-bg px-4 py-3 text-sm font-medium text-adm-danger"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-adm-success-border bg-adm-success-bg px-4 py-3 text-sm font-medium text-adm-success"
        >
          Options saved and variants updated.
        </div>
      )}

      <div className="space-y-4">
        {options.map((opt, index) => (
          <div
            key={index}
            className="relative flex flex-col gap-3 rounded-xl border border-adm-border bg-adm-surface-2/60 p-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor={`opt-name-${index}`}
                className="block text-xs font-medium text-adm-fg-2"
              >
                Option Name
              </label>
              <input
                id={`opt-name-${index}`}
                type="text"
                required
                value={opt.name}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                onChange={(e) =>
                  handleOptionChange(index, 'name', e.target.value)
                }
                placeholder="e.g. Size or Color"
                className="block w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2 text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
              />
            </div>

            <div className="flex-[2] space-y-1.5">
              <label
                htmlFor={`opt-values-${index}`}
                className="block text-xs font-medium text-adm-fg-2"
              >
                Values (comma separated)
              </label>
              <input
                id={`opt-values-${index}`}
                type="text"
                required
                value={opt.valuesString}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                onChange={(e) =>
                  handleOptionChange(index, 'valuesString', e.target.value)
                }
                placeholder="e.g. S, M, L or Red, Blue"
                className="block w-full min-h-[44px] rounded-xl border border-adm-input-border bg-adm-surface px-3.5 py-2 text-sm text-adm-fg placeholder:text-adm-muted focus-visible:outline-2 focus-visible:outline-adm-accent focus-visible:outline-offset-1"
              />
            </div>

            <button
              type="button"
              onClick={() => removeOptionDimension(index)}
              className="absolute top-2.5 right-2.5 sm:relative sm:top-auto sm:right-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-adm-border bg-adm-surface text-adm-muted hover:bg-adm-danger-bg hover:text-adm-danger hover:border-adm-danger-border transition-colors cursor-pointer shrink-0"
              aria-label={`Remove option ${opt.name || index + 1}`}
              title="Remove option"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}

        {options.length === 0 && (
          <div className="rounded-xl border border-dashed border-adm-border py-6 text-center text-sm text-adm-muted">
            No options configured.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={addOptionDimension}
            disabled={options.length >= 3}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-fg hover:bg-adm-surface-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Option</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="min-h-[42px] rounded-xl bg-adm-accent px-5 py-2 text-xs font-semibold text-adm-accent-fg hover:bg-adm-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isPending ? 'Saving...' : 'Save & Generate Variants'}
          </button>
        </div>
      </div>
    </div>
  )
}
