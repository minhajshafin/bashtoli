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
    <section className="relative overflow-hidden py-18 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-10 bg-forest-950 bg-laid-paper-dark">
      {/* Minimalist Drifting Sumi-e Leaf */}
      <DriftingBambooLeaf
        theme="dark"
        className="right-8 sm:right-16 bottom-12 hidden sm:block opacity-45 pointer-events-none"
        rotation={-22}
        scale={0.9}
      />

      <div className="relative z-10 max-w-[1440px] xl:max-w-[1520px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-start">
        {/* Left Column: High-Legibility Editorial Copy (Max-w-xl) */}
        <div className="lg:col-span-5 max-w-xl text-left">
          {/* Overline Kicker */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="h-px w-6 sm:w-8 bg-gold-500/70" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-gold-400">
              Customer Requests · Dhaka
            </span>
          </div>

          {/* High-Contrast Display Headline */}
          <h2 className="font-display font-medium text-cream-50 text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.12] tracking-[-0.015em] text-balance mb-5">
            Looking for something{' '}
            <em className="font-editorial italic font-normal text-gold-300">
              in particular?
            </em>
          </h2>

          {/* Crisp, Highly Readable Sans Body Text */}
          <p className="font-sans text-[15px] sm:text-base lg:text-[17px] leading-[1.75] text-cream-100/95 font-normal text-pretty mb-8">
            Tell us which fountain pen, notebook, or specialty paper you&apos;re searching for. We read every note and stock our shelves around what our community asks for most.
          </p>

          {/* Reassuring Community Note */}
          <div className="pt-6 border-t border-forest-800">
            <p className="text-xs sm:text-[13px] font-sans text-cream-300/80 leading-relaxed">
              No account needed. Your suggestions directly guide what we bring in on our next stocking run.
            </p>
          </div>
        </div>

        {/* Right Column: Balanced Form with Flawless Full-Width Alignment (Max-w-xl) */}
        <div className="lg:col-span-7 flex justify-start lg:justify-end w-full">
          <div className="w-full max-w-xl">
            {submitted ? (
              <div className="py-10 sm:py-14 text-left animate-fade-in border-l-2 border-gold-500 pl-6 sm:pl-8">
                <h3 className="font-display text-2xl sm:text-3xl text-cream-50 font-medium mb-2.5">
                  Thank you — we&apos;ve noted it down.
                </h3>
                <p className="font-sans text-base sm:text-[17px] text-cream-200 mb-6 leading-relaxed max-w-md">
                  Your suggestion has been added to our shop logbook for the next stocking trip.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs uppercase tracking-[0.18em] font-sans font-semibold text-gold-400 hover:text-gold-300 transition-colors cursor-pointer border-b border-gold-400/60 hover:border-gold-300 pb-1"
                >
                  Suggest another item →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
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

                {/* Field 1: Primary Request (Full Width) */}
                <div className="relative group">
                  <label
                    htmlFor="suggestion-message"
                    className="block text-xs uppercase tracking-[0.16em] font-sans font-semibold text-cream-200 mb-2"
                  >
                    The item you&apos;d like us to carry <span className="text-gold-400">*</span>
                  </label>
                  <textarea
                    id="suggestion-message"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="e.g. Midori MD A5 Notebook, Pilot Iroshizuku ink, brass ruler…"
                    aria-label="What item would you like us to carry?"
                    required
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-forest-700/80 group-hover:border-forest-600 focus:border-gold-400 text-cream-50 placeholder:text-forest-400/75 text-base font-sans focus:outline-none transition-colors duration-200 resize-none py-2 px-0 leading-relaxed"
                  />
                </div>

                {/* Field 2: Name (Full Width, Perfectly Aligned) */}
                <div className="relative group">
                  <label
                    htmlFor="suggestion-name"
                    className="block text-xs uppercase tracking-[0.16em] font-sans font-semibold text-cream-200 mb-2"
                  >
                    Your name <span className="text-forest-300 font-normal lowercase tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="suggestion-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="How should we know you?"
                    aria-label="Your name (optional)"
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-forest-700/80 group-hover:border-forest-600 focus:border-gold-400 text-cream-50 placeholder:text-forest-400/75 text-base font-sans focus:outline-none transition-colors duration-200 py-2 px-0"
                  />
                </div>

                {/* Field 3: Contact (Full Width, Perfectly Aligned) */}
                <div className="relative group">
                  <label
                    htmlFor="suggestion-contact"
                    className="block text-xs uppercase tracking-[0.16em] font-sans font-semibold text-cream-200 mb-2"
                  >
                    Contact <span className="text-forest-300 font-normal lowercase tracking-normal">(email or phone)</span>
                  </label>
                  <input
                    id="suggestion-contact"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="If you'd like us to notify you (optional)"
                    aria-label="Email or phone (optional)"
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-forest-700/80 group-hover:border-forest-600 focus:border-gold-400 text-cream-50 placeholder:text-forest-400/75 text-base font-sans focus:outline-none transition-colors duration-200 py-2 px-0"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs sm:text-sm text-rose-200 py-3 px-4 bg-rose-950/60 border border-rose-800/80 rounded-xl font-sans">
                    {errorMessage}
                  </p>
                )}

                {/* Action Row: Left-Aligned Microcopy + Right-Aligned Submit Button */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs font-sans text-forest-300/80">
                    Directly reviewed by our shopkeeper.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-sans uppercase tracking-[0.18em] font-bold bg-gold-500 text-forest-950 hover:bg-gold-400 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group shadow-subtle shrink-0"
                  >
                    {isSubmitting ? (
                      <span>Sending to shop…</span>
                    ) : (
                      <>
                        <span>Send suggestion</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
