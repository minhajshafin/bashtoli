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
    <section className="py-20 px-5 md:px-8 bg-forest-900">
      <div className="max-w-xl mx-auto text-center">
        <p
          className="text-[11px] uppercase tracking-[0.28em] mb-4"
          style={{ color: '#c9a96e' }}
        >
          Help Us Grow
        </p>
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            color: '#f5ede0',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.15,
          }}
        >
          Don&apos;t see what<br />you&apos;re looking for?
        </h2>
        <p className="mb-10 text-sm leading-relaxed text-forest-400 font-light">
          We&apos;re a new shop building our collection around what{' '}
          <em className="text-forest-300">you</em> want. Tell us what&apos;s missing &mdash; we read every
          suggestion and do our best to source it.
        </p>

        {submitted ? (
          <div className="py-8">
            <p
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1.25rem',
                color: '#c9a96e',
                fontStyle: 'italic',
              }}
            >
              Thank you &mdash; we&apos;ll look into it. &#10022;
            </p>
            <p className="mt-3 text-sm text-forest-400">Your suggestion helps us build a better shop.</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 text-xs text-gold-400 hover:text-gold-300 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Suggest another item
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                disabled={isSubmitting}
                className="px-5 py-3 text-sm outline-none rounded-full bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-forest-500 focus:border-gold-500 disabled:opacity-60 transition-colors"
              />
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or phone (optional)"
                disabled={isSubmitting}
                className="px-5 py-3 text-sm outline-none rounded-full bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-forest-500 focus:border-gold-500 disabled:opacity-60 transition-colors"
              />
            </div>

            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="What item would you like us to carry? Be as specific as you like — brand, type, price range…"
              required
              rows={3}
              disabled={isSubmitting}
              className="px-5 py-3.5 text-sm outline-none resize-none rounded-2xl bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-forest-500 focus:border-gold-500 disabled:opacity-60 transition-colors leading-relaxed"
            />

            {errorMessage && (
              <p className="text-xs text-rose-400 px-3 py-2 bg-rose-950/40 rounded-lg border border-rose-900/50">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="self-end px-8 py-3 text-sm font-semibold rounded-full bg-gold-500 text-forest-800 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span>Sending...</span>
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

