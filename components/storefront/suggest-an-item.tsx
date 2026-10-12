'use client'

import React, { useState } from 'react'
import { submitSuggestionAction } from '@/lib/actions/suggestions'
import { DriftingBambooLeaf } from '@/components/storefront/bamboo-motifs'

export function SuggestAnItem() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!suggestion.trim()) {
      setErrorMessage('Please describe the item you would like us to carry.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await submitSuggestionAction({
        name,
        contact,
        suggestion,
        honeypot,
      })

      if (res.success) {
        setSubmitted(true)
        setName('')
        setContact('')
        setSuggestion('')
        setHoneypot('')
      } else {
        setErrorMessage(res.error || 'Unable to submit your suggestion. Please try again.')
      }
    } catch {
      setErrorMessage('A network error occurred. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setErrorMessage(null)
  }

  return (
    <section
      id="suggest"
      className="relative overflow-hidden py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 xl:px-10 bg-forest-950 bg-laid-paper-dark"
    >
      {/* Minimalist Drifting Sumi-e Leaf Accent */}
      <DriftingBambooLeaf
        theme="dark"
        className="right-6 sm:right-12 bottom-6 hidden sm:block opacity-40 pointer-events-none"
        rotation={-18}
        scale={0.85}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Tactile Stationery Request Card */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-forest-900/80 border border-gold-500/20 p-5 sm:p-8 md:p-9 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-7">
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="h-px w-4 sm:w-5 bg-gold-400/60" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-sans font-semibold text-gold-400">
                Shopkeeper&apos;s Logbook · Dhaka
              </span>
              <span className="h-px w-4 sm:w-5 bg-gold-400/60" />
            </div>

            <h2 className="font-display font-medium text-cream-50 text-xl sm:text-2xl lg:text-[1.75rem] leading-tight tracking-[-0.015em] text-balance mb-2">
              Looking for something{' '}
              <em className="font-editorial italic font-normal text-gold-300">
                in particular?
              </em>
            </h2>

            <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-cream-200/80 text-pretty">
              Leave a note in our logbook. We read every request and hunt for it on our weekly stocking runs in Dhaka.
            </p>
          </div>

          {submitted ? (
            /* Warm Stationery Confirmation State */
            <div className="py-6 sm:py-8 text-center animate-fade-in space-y-3">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>

              <h3 className="font-display text-lg sm:text-xl text-cream-50 font-medium">
                Note Slipped into Logbook
              </h3>

              <p className="font-sans text-xs text-cream-200/80 max-w-md mx-auto leading-relaxed">
                Thank you! Your suggestion has been noted for our upcoming stocking trip.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs uppercase tracking-[0.16em] font-sans font-semibold text-gold-400 hover:text-gold-300 transition-colors cursor-pointer border-b border-gold-400/60 hover:border-gold-300 pb-0.5"
                >
                  Suggest another item &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Tactile Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bot Honeypot Trap */}
              <input
                type="text"
                name="b_hp_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Field 1: The Requested Item (Primary Textarea) */}
              <div>
                <label
                  htmlFor="suggestion-message"
                  className="block text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-sans font-semibold text-gold-400/90 mb-1.5"
                >
                  The item you&apos;d like us to stock <span className="text-gold-400">*</span>
                </label>
                <div className="rounded-xl bg-forest-950/70 border border-forest-700/80 focus-within:border-gold-500/70 focus-within:ring-1 focus-within:ring-gold-500/20 transition-all p-3 shadow-inner">
                  <textarea
                    id="suggestion-message"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="e.g. Midori MD A5 Notebook, Kaweco Brass Sport 0.7mm, Iroshizuku Yama-budo ink…"
                    aria-label="What item would you like us to carry?"
                    required
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full bg-transparent text-xs sm:text-[13px] text-cream-50 placeholder:text-forest-400/70 font-sans focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Row 2: Name & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="suggestion-name"
                    className="block text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-sans font-semibold text-cream-200/80 mb-1.5"
                  >
                    Your name <span className="text-forest-400 font-normal lowercase tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="suggestion-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="How should we know you?"
                    aria-label="Your name (optional)"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-forest-950/70 border border-forest-700/80 focus:border-gold-500/70 focus:outline-none focus:ring-1 focus:ring-gold-500/20 px-3.5 py-2 text-xs text-cream-50 placeholder:text-forest-400/70 font-sans transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label
                    htmlFor="suggestion-contact"
                    className="block text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-sans font-semibold text-cream-200/80 mb-1.5"
                  >
                    Contact <span className="text-forest-400 font-normal lowercase tracking-normal">(WhatsApp or email)</span>
                  </label>
                  <input
                    id="suggestion-contact"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="To notify you when it arrives"
                    aria-label="Email or phone (optional)"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-forest-950/70 border border-forest-700/80 focus:border-gold-500/70 focus:outline-none focus:ring-1 focus:ring-gold-500/20 px-3.5 py-2 text-xs text-cream-50 placeholder:text-forest-400/70 font-sans transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <p className="text-xs text-rose-200 py-2.5 px-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl font-sans">
                  {errorMessage}
                </p>
              )}

              {/* Bottom Actions Row */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] font-sans text-forest-400/80">
                  Directly reviewed by our shopkeeper &middot; No account needed
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-sans uppercase tracking-[0.16em] font-bold bg-gold-500 text-forest-950 hover:bg-gold-400 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group shadow-sm shrink-0 self-end sm:self-auto"
                >
                  {isSubmitting ? (
                    <span>Slipping into logbook…</span>
                  ) : (
                    <>
                      <span>Leave Note</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
