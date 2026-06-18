import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'

export function monthlyGoal(params) {
  return reqNum(params.monthlyGoal)
}

// Tiers describe collection bands ABOVE the goal. Band lower bounds chain:
// tier 0 lower = goal, tier n lower = tier (n-1) upper. Uppers must ascend.
export function validateTiers(params) {
  const goal = reqNum(params.monthlyGoal)
  const tiers = Array.isArray(params.tiers) ? params.tiers : []
  if (goal === null) return 'Set a monthly goal before adding tiers.'
  let lower = goal
  for (let i = 0; i < tiers.length; i++) {
    const upper = num(tiers[i].upper)
    if (upper === null) continue
    if (upper <= lower) {
      return `Tier ${i + 1} upper bound ($${upper.toLocaleString()}) must be greater than the previous band ($${lower.toLocaleString()}). Tiers cannot overlap.`
    }
    lower = upper
  }
  return null
}

export function calc(params, metricValue) {
  const monthlyBase = reqNum(params.baseSalary)
  const goal = reqNum(params.monthlyGoal)
  const actualCollections = num(metricValue)
  const tiers = Array.isArray(params.tiers) ? params.tiers : []
  if (monthlyBase === null || goal === null || actualCollections === null) {
    return { ...EMPTY_RESULT, monthlyBase, extra: { monthlyGoal: goal } }
  }

  let bonusEarned = 0
  let remaining = Math.max(0, actualCollections - goal)
  let lower = goal
  for (const tier of tiers) {
    const upper = num(tier.upper)
    const pct = num(tier.pct)
    if (upper === null || pct === null) continue
    const bandAmount = Math.min(remaining, Math.max(0, upper - lower))
    bonusEarned += bandAmount * (pct / 100)
    remaining -= bandAmount
    lower = upper
    if (remaining <= 0) break
  }
  // Anything above the top tier earns at the top tier's rate (open-ended top band).
  if (remaining > 0 && tiers.length > 0) {
    const topPct = num(tiers[tiers.length - 1].pct) ?? 0
    bonusEarned += remaining * (topPct / 100)
  }

  const totalComp = monthlyBase + bonusEarned
  return {
    bonus: bonusEarned,
    totalComp,
    annualComp: totalComp * 12,
    costPct: safeDiv(totalComp, actualCollections),
    belowGoal: actualCollections < goal,
    note: null,
    monthlyBase,
    extra: { monthlyGoal: goal, tiers },
  }
}
