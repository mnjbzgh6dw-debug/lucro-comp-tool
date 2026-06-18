import { fmtPct } from './format'

// Verdict levels map to palette tokens used across UI + print.
export const VERDICT = {
  sustainable: { level: 'sustainable', label: 'Sustainable', icon: '✅', color: 'gold' },
  watch: { level: 'watch', label: 'Watch', icon: '⚠️', color: 'amber' },
  unsustainable: { level: 'unsustainable', label: 'Unsustainable', icon: '❌', color: 'red' },
  none: { level: 'none', label: '—', icon: '', color: 'none' },
}

/**
 * Per-row badge from cost % of collections.
 *   <= target%            -> Sustainable (gold)
 *   target%+1 .. +5       -> Watch (amber)
 *   > target%+5           -> Unsustainable (red)
 *   > 100%                -> Unsustainable + special note
 * @param {number|null} costPct  fraction (0.25 = 25%)
 * @param {number} targetPct     whole-number percent
 */
export function rowVerdict(costPct, targetPct) {
  if (costPct === null || costPct === undefined || !Number.isFinite(Number(costPct))) {
    return { ...VERDICT.none, note: null }
  }
  const pct = Number(costPct) * 100

  if (pct > 100) {
    return {
      ...VERDICT.unsustainable,
      note: "Collections don't cover compensation at this level",
    }
  }
  if (pct <= targetPct) return { ...VERDICT.sustainable, note: null }
  if (pct <= targetPct + 5) return { ...VERDICT.watch, note: null }
  return { ...VERDICT.unsustainable, note: null }
}

/** Plain-English one-sentence summary for the At-Goal row. */
export function buildSummary({ name, costPct, targetPct }) {
  const who = name?.trim() || 'Your team member'
  if (costPct === null || costPct === undefined || !Number.isFinite(Number(costPct))) {
    return `Enter the remaining parameters to see how ${who}'s compensation lands against your ${targetPct}% threshold.`
  }
  const pct = Number(costPct) * 100
  const v = rowVerdict(costPct, targetPct)

  if (v.level === 'sustainable') {
    return `At goal, ${who}'s total comp represents ${fmtPct(costPct)} of collections — within your ${targetPct}% threshold. Strong months generate meaningful bonus without straining payroll.`
  }
  if (v.level === 'watch') {
    return `At goal, ${who}'s total comp is ${fmtPct(costPct)} of collections — just above your ${targetPct}% threshold. Workable, but watch it closely as the relationship grows.`
  }
  if (pct > 100) {
    return `At goal, ${who}'s comp exceeds collections (${fmtPct(costPct)}). Collections don't cover compensation at this level — revisit the base or goal before the conversation.`
  }
  return `At goal, ${who}'s total comp is ${fmtPct(costPct)} of collections — more than 5 points above your ${targetPct}% threshold. This structure may be hard to sustain as-is.`
}
