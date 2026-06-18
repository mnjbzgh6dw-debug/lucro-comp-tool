import { useState } from 'react'

// Renders /lucro-logo.svg when present; otherwise a styled LUCRO wordmark
// so neither the app nor the print output ever shows a broken image.
export default function Logo({ className = '', wordmarkClass = '', dark = false }) {
  const [failed, setFailed] = useState(false)
  const base = import.meta.env.BASE_URL || '/'
  const src = `${base}lucro-logo.svg`

  if (failed) {
    return (
      <span
        className={`font-display font-bold tracking-tight ${
          dark ? 'text-navy' : 'text-white'
        } ${wordmarkClass}`}
      >
        LUCRO
      </span>
    )
  }

  return (
    <img
      src={src}
      alt="Lucro"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
