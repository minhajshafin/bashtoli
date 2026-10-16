'use client'

import React, { useState } from 'react'
import { submitSuggestionAction } from '@/lib/actions/suggestions'
import { ScrollReveal } from '@/components/storefront/scroll-reveal'

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
      className="relative overflow-hidden py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 xl:px-10 bg-forest-950 bg-laid-paper-dark"
    >
      <div className="relative z-10 max-w-xl mx-auto">
        {/* Minimal Header */}
        <ScrollReveal>
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="h-px w-4 bg-gold-400/60" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-gold-400/90">
                Special Requests
              </span>
            </div>

            <h2 className="font-display font-medium text-cream-50 text-xl sm:text-2xl lg:text-[1.75rem] leading-snug tracking-[-0.015em] mb-2">
              Looking for something in particular?
            </h2>

            <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-cream-200/75 max-w-md mx-auto text-pretty">
              Tell us what you&apos;re searching for — we hunt for customer requests on our weekly sourcing runs in Dhaka.
            </p>
          </div>
        </ScrollReveal>

        {submitted ? (
          /* Confirmation State */
          <div className="py-6 text-center animate-fade-in space-y-2.5 rounded-2xl bg-forest-900/40 border border-forest-800/80 p-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            <h3 className="font-display text-base sm:text-lg text-cream-50 font-medium">
              Note Slipped into Logbook
            </h3>

            <p className="font-sans text-xs text-cream-200/75 max-w-sm mx-auto leading-relaxed">
              Thank you! Your suggestion has been noted for our upcoming stocking trip.
            </p>

            <div className="pt-1.5">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs uppercase tracking-[0.16em] font-sans font-medium text-text-accent hover:text-text-accent-hover transition-colors cursor-pointer border-b border-gold-400/50 pb-0.5"
              >
                Suggest another item &rarr;
              </button>
            </div>
          </div>
        ) : (
          /* Minimal Form Card */
          <div className="rounded-2xl bg-forest-900/40 border border-forest-800/80 p-4 sm:p-5.5 backdrop-blur-xs">
            <form onSubmit={handleSubmit} className="space-y-3">
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
                <textarea
                  id="suggestion-message"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="What notebook, pen, ink, or stationery item would you like us to carry?"
                  aria-label="What item would you like us to carry?"
                  required
                  rows={2}
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-forest-950/60 border border-forest-800/80 focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/20 px-3.5 py-2.5 text-xs sm:text-[13px] text-cream-50 placeholder:text-forest-400/70 font-sans resize-none leading-relaxed transition-all"
                />
              </div>

              {/* Row 2: Name & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  id="suggestion-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  aria-label="Your name (optional)"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-forest-950/60 border border-forest-800/80 focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/20 px-3.5 py-2 text-xs text-cream-50 placeholder:text-forest-400/70 font-sans transition-all"
                />

                <input
                  id="suggestion-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email or WhatsApp (optional)"
                  aria-label="Email or phone (optional)"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-forest-950/60 border border-forest-800/80 focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/20 px-3.5 py-2 text-xs text-cream-50 placeholder:text-forest-400/70 font-sans transition-all"
                />
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <p className="text-xs text-terracotta-400 py-2 px-3 bg-terracotta-800/40 border border-terracotta-600/60 rounded-xl font-sans">
                  {errorMessage}
                </p>
              )}

              {/* Bottom Actions Row */}
              <div className="pt-1 flex items-center justify-between gap-3">
                <span className="text-[10px] sm:text-[11px] font-sans text-forest-400/80">
                  Reviewed weekly &middot; No account needed
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-accent inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-sans uppercase tracking-[0.16em] font-semibold disabled:opacity-50 disabled:cursor-not-allowed group shrink-0"
                >
                  {isSubmitting ? (
                    <span>Sending…</span>
                  ) : (
                    <>
                      <span>Leave Note</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
