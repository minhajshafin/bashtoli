'use client'

import React, { useState } from 'react'

export function SuggestAnItem() {
  const [name, setName] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (suggestion.trim()) setSubmitted(true)
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="px-5 py-3 text-sm outline-none rounded-full bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-forest-500 focus:border-gold-500 transition-colors"
            />
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="What item would you like us to carry? Be as specific as you like — brand, type, price range…"
              required
              rows={3}
              className="px-5 py-3.5 text-sm outline-none resize-none rounded-2xl bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-forest-500 focus:border-gold-500 transition-colors leading-relaxed"
            />
            <button
              type="submit"
              className="self-end px-8 py-3 text-sm font-semibold rounded-full bg-gold-500 text-forest-800 hover:bg-gold-400 transition-colors flex items-center gap-2"
            >
              Share with us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
