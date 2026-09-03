import React from 'react'

interface SuggestionAlertEmailProps {
  name?: string | null
  contact?: string | null
  suggestion: string
  submittedAt?: string
}

export function SuggestionAlertEmail({
  name,
  contact,
  suggestion,
  submittedAt,
}: SuggestionAlertEmailProps) {
  const displayName = name?.trim() ? name.trim() : 'Anonymous Customer'
  const displayContact = contact?.trim() ? contact.trim() : 'Not provided'
  const timeString = submittedAt || new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '12px',
        overflow: 'hidden',
        color: '#27272a',
      }}
    >
      <div
        style={{
          backgroundColor: '#1b382b',
          padding: '24px 28px',
          borderBottom: '3px solid #c9a96e',
        }}
      >
        <p
          style={{
            margin: '0 0 6px 0',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#c9a96e',
            fontWeight: 600,
          }}
        >
          Bashtoli Storefront
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: '22px',
            color: '#f5ede0',
            fontWeight: 400,
            fontStyle: 'italic',
          }}
        >
          New Item Suggestion
        </h1>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#52525b', lineHeight: '1.5' }}>
          A customer has suggested an item they would like to see in the Bashtoli collection:
        </p>

        <div
          style={{
            backgroundColor: '#f7f5f0',
            borderLeft: '4px solid #c9a96e',
            borderRadius: '4px',
            padding: '16px 20px',
            margin: '20px 0',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#1b382b',
              whiteSpace: 'pre-wrap',
            }}
          >
            {suggestion}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#fafafa',
            border: '1px solid #f4f4f5',
            borderRadius: '8px',
            padding: '16px 20px',
            margin: '20px 0',
            fontSize: '13px',
            lineHeight: '1.8',
          }}
        >
          <div>
            <strong style={{ color: '#3f3f46' }}>Submitted by:</strong>{' '}
            <span style={{ color: '#18181b' }}>{displayName}</span>
          </div>
          <div>
            <strong style={{ color: '#3f3f46' }}>Contact:</strong>{' '}
            <span style={{ color: '#18181b' }}>{displayContact}</span>
          </div>
          <div>
            <strong style={{ color: '#3f3f46' }}>Time (Dhaka):</strong>{' '}
            <span style={{ color: '#71717a' }}>{timeString}</span>
          </div>
        </div>

        <p
          style={{
            margin: '24px 0 0 0',
            fontSize: '12px',
            color: '#a1a1aa',
            textAlign: 'center',
            borderTop: '1px solid #f4f4f5',
            paddingTop: '16px',
          }}
        >
          Received via Bashtoli &ldquo;Don&apos;t see what you&apos;re looking for?&rdquo; suggestion form.
        </p>
      </div>
    </div>
  )
}
