'use client'

import React, { useState } from 'react'
import { submitSuggestionAction } from '@/lib/actions/suggestions'

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
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-forest-950 border-t border-forest-800/80">
      <div className="max-w-xl mx-auto text-center">
        <h2
          className="mb-3.5 font-editorial text-cream-100 font-normal leading-tight text-2xl sm:text-3xl md:text-4xl"
        >
          Don&apos;t see what<br />you&apos;re looking for?
        </h2>
        <p className="mb-7 text-xs sm:text-sm leading-relaxed text-forest-300 font-light max-w-md mx-auto font-sans">
          We curate our atelier collection around what{' '}
          <em className="text-gold-300 font-editorial">you</em> reach for. Tell us what&apos;s missing &mdash; we read every
          dispatch and source directly from artisanal makers.
        </p>

        {submitted ? (
          <div className="py-8 bg-forest-900/50 rounded-2xl border border-forest-800 p-6 animate-fade-in">
            <p
              className="font-editorial text-xl sm:text-2xl text-gold-300 mb-2"
            >
              Thank you &mdash; we&apos;ll look into it. &#10022;
            </p>
            <p className="text-sm text-forest-300 font-sans">Your suggestion directly shapes our next atelier shipment.</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300 underline underline-offset-4 transition-colors cursor-pointer font-sans"
            >
              Suggest another item
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
            {/* Honeypot field for bot suppression */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="suggestion-name" className="sr-only">
                  Your name (optional)
                </label>
                <input
                  id="suggestion-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  aria-label="Your name (optional)"
                  disabled={isSubmitting}
                  className="w-full px-5 py-3 text-xs sm:text-sm outline-none rounded-full bg-forest-900/90 border border-forest-800 text-cream-100 placeholder:text-forest-400 focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60 transition-all shadow-inner font-sans"
                />
              </div>
              <div>
                <label htmlFor="suggestion-contact" className="sr-only">
                  Email or phone (optional)
                </label>
                <input
                  id="suggestion-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email or phone (optional)"
                  aria-label="Email or phone (optional)"
                  disabled={isSubmitting}
                  className="w-full px-5 py-3 text-xs sm:text-sm outline-none rounded-full bg-forest-900/90 border border-forest-800 text-cream-100 placeholder:text-forest-400 focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60 transition-all shadow-inner font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="suggestion-message" className="sr-only">
                What item would you like us to carry?
              </label>
              <textarea
                id="suggestion-message"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="What item would you like us to carry? Be as specific as you like — brand, paper weight, nib size…"
                aria-label="What item would you like us to carry?"
                required
                rows={3}
                disabled={isSubmitting}
                className="w-full px-5 py-3.5 text-xs sm:text-sm outline-none resize-none rounded-2xl bg-forest-900/90 border border-forest-800 text-cream-100 placeholder:text-forest-400 focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60 transition-all leading-relaxed shadow-inner font-sans"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-300 px-4 py-2.5 bg-rose-950/60 rounded-xl border border-rose-900/60 font-sans">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="self-end px-8 py-3 text-xs uppercase tracking-widest font-semibold rounded-full bg-gold-500 text-forest-950 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98 font-sans"
            >
              {isSubmitting ? (
                <>
                  <span>Sending...</span>
                  <svg
                    className="w-4 h-4 animate-spin text-forest-950"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span>Share with us</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

