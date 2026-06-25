import { num } from './_helpers'

/**
 * Shared tier bonus calculator.
 * bands: [{ from, to, pct }] — `to` may be Infinity for the open-ended top band.
 * overage: dollars above the goal (never negative).
 * method: 'Cumulative' | 'Cliff'
 */
export function calcTierBonus(bands, overage, method) {
  if (!overage || overage <= 0 || !bands.length) return 0
  if (method === 'Cliff') return calcCliff(bands, overage)
  return calcCumulative(bands, overage)
}

function calcCumulative(bands, overage) {
  let bonus = 0
  let remaining = overage
  for (const { from, to, pct } of bands) {
    if (remaining <= 0) break
    const bandWidth = to === Infinity ? remaining : Math.max(0, to - from)
    const inBand = Math.min(remaining, bandWidth)
    bonus += inBand * (pct / 100)
    remaining -= inBand
  }
  return bonus
}

function calcCliff(bands, overage) {
  let rate = bands[0].pct
  for (const { to, pct } of bands) {
    rate = pct
    if (to === Infinity || overage <= to - bands[0].from + bands[0].from) break
    if (overage <= to) break
  }
  // Walk forward: find the last band whose `to` the overage does NOT exceed
  rate = bands[bands.length - 1].pct
  for (const { from, to, pct } of bands) {
    if (to === Infinity || overage <= to) { rate = pct; break }
  }
  return overage * (rate / 100)
}

/**
 * Convert tiered_collections params into a normalised band array.
 * Bands are expressed as overage (dollars above goal), not raw collections.
 */
export function tieredBands(params) {
  const goal = num(params.monthlyGoal)
  const tiers = Array.isArray(params.tiers) ? params.tiers : []
  if (goal === null || !tiers.length) return []
  const bands = []
  let lower = 0 // overage from
  for (const tier of tiers) {
    const upper = num(tier.upper)
    const pct = num(tier.pct)
    if (upper === null || pct === null) continue
    const to = upper - goal
    if (to <= lower) continue
    bands.push({ from: lower, to, pct })
    lower = to
  }
  // Open-ended top band at last configured rate
  if (tiers.length > 0) {
    const lastPct = num(tiers[tiers.length - 1].pct)
    if (lastPct !== null) bands.push({ from: lower, to: Infinity, pct: lastPct })
  }
  return bands
}

/**
 * Convert hybrid_two_tier params into a normalised band array.
 */
export function hybridBands(params) {
  const cap = num(params.tier1Cap)
  const t1Pct = num(params.tier1Pct)
  const t2Pct = num(params.tier2Pct)
  if (cap === null || t1Pct === null || t2Pct === null) return []
  return [
    { from: 0, to: cap, pct: t1Pct },
    { from: cap, to: Infinity, pct: t2Pct },
  ]
}
