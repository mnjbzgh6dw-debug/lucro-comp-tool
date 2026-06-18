// Renders a sustainability badge from a verdict object (see utils/verdict.js).
const STYLES = {
  gold: 'bg-light-gold text-navy border border-gold',
  amber: 'bg-amber/15 text-amber border border-amber/40',
  red: 'bg-red/10 text-red border border-red/40',
  none: 'bg-navy/5 text-navy/40 border border-navy/10',
}

export default function VerdictBadge({ verdict, size = 'sm' }) {
  if (!verdict) return null
  const pad = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ${pad} ${
        STYLES[verdict.color] || STYLES.none
      }`}
    >
      {verdict.icon && <span aria-hidden="true">{verdict.icon}</span>}
      {verdict.label}
    </span>
  )
}
