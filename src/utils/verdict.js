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

/**
 * Multi-row verdict narrative for the print one-pager.
 * Covers all three default rows (below / at / above goal).
 */
export function buildFullVerdictSummary({ name, rows, targetPct }) {
  const possessive = name?.trim() ? `${name}'s` : "your team member's"
  const atGoalRow  = rows.find((r) => r.label === 'At Goal')
  const belowGoalRow = rows.find((r) => r.label === 'Below Goal')

  const atCostPct    = atGoalRow?.result?.costPct
  const belowCostPct = belowGoalRow?.result?.costPct
  const atMetric     = atGoalRow?.metricNumber
  const belowMetric  = belowGoalRow?.metricNumber

  if (atCostPct == null) return null

  const atVerdict    = rowVerdict(atCostPct, targetPct)
  const belowVerdict = belowCostPct != null ? rowVerdict(belowCostPct, targetPct) : null
  const atGoalFmt    = atMetric != null ? `$${atMetric.toLocaleString()}` : 'the goal'
  const belowFmt     = belowMetric != null ? `$${belowMetric.toLocaleString()}` : null

  if (atVerdict.level === 'sustainable') {
    if (belowVerdict && belowVerdict.level !== 'sustainable' && belowFmt) {
      return `${possessive} total comp stays within your ${targetPct}% target once collections reach ${atGoalFmt}. Below that level, the base alone exceeds your threshold (${fmtPct(belowCostPct)} at ${belowFmt} in collections) — worth watching if a slow month becomes a pattern.`
    }
    return `${possessive} comp stays within your ${targetPct}% threshold at goal (${fmtPct(atCostPct)}) and holds there in stronger months too.`
  }

  const cap = possessive.charAt(0).toUpperCase() + possessive.slice(1)
  if (atVerdict.level === 'watch') {
    return `${cap} comp at goal is ${fmtPct(atCostPct)} — just above your ${targetPct}% threshold. Workable, but worth monitoring closely.`
  }
  return `${cap} comp at goal is ${fmtPct(atCostPct)} — more than 5 points above your ${targetPct}% threshold. This structure may be hard to sustain as-is.`
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
