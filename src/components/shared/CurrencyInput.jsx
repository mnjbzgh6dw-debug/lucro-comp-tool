import { useState } from 'react'
import { fmtCurrency } from '../../utils/format'

// Currency input: user types a raw number; on blur it renders formatted.
// Stores a numeric value (or '' when empty) via onChange.
export default function CurrencyInput({
  value,
  onChange,
  prefix = '$',
  placeholder = '0',
  className = '',
  id,
}) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState('')

  const display = focused
    ? draft
    : value === '' || value === null || value === undefined
      ? ''
      : fmtCurrency(value).replace(/^\$/, '')

  function handleChange(e) {
    // Allow digits and a single decimal point only.
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDraft(raw)
    if (raw === '' || raw === '.') {
      onChange('')
    } else {
      const n = Number(raw)
      onChange(Number.isFinite(n) ? n : '')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy/50">
        {prefix}
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder}
        onFocus={() => {
          setFocused(true)
          setDraft(value === '' || value === null || value === undefined ? '' : String(value))
        }}
        onBlur={() => setFocused(false)}
        onChange={handleChange}
        className="tabular w-full rounded-lg border border-navy/15 bg-light-gold py-2 pl-7 pr-3 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40"
      />
    </div>
  )
}
