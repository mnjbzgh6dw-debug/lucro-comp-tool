// Display formatters. Any null / non-finite value renders as an em dash,
// so the UI never shows NaN or Infinity.
export const DASH = '—'

export function fmtCurrency(v, { decimals = 0 } = {}) {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return DASH
  return Number(v).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtNumber(v, { decimals = 0 } = {}) {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return DASH
  return Number(v).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// costPct values are stored as fractions (0.25 = 25%).
export function fmtPct(fraction, { decimals = 1 } = {}) {
  if (fraction === null || fraction === undefined || !Number.isFinite(Number(fraction)))
    return DASH
  return `${(Number(fraction) * 100).toFixed(decimals)}%`
}

// Format a scenario metric according to the structure's metric format.
export function fmtMetric(v, format) {
  if (format === 'currency') return fmtCurrency(v)
  if (format === 'number') return fmtNumber(v)
  return fmtNumber(v) // 'auto' / fallback
}

// Format a single structure parameter for display (panels + print summary).
export function fmtParam(field, params) {
  const v = params[field.key]
  if (v === '' || v === null || v === undefined) return DASH
  switch (field.type) {
    case 'percentSelect':
      return `${v}%`
    case 'toggle': {
      const opt = field.options.find((o) => o.value === v)
      return opt ? opt.label : String(v)
    }
    case 'number':
      return fmtNumber(v)
    case 'currency':
    default: {
      const asCurrency = field.currencyIf ? field.currencyIf(params) : true
      return asCurrency ? fmtCurrency(v) : fmtNumber(v)
    }
  }
}
