import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'
import { calcTierBonus, tieredBands } from './_tierCalc'

export function monthlyGoal(params) {
  return reqNum(params.monthlyGoal)
}

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
  const method = params.tierMethod || 'Cumulative'

  if (monthlyBase === null || goal === null || actualCollections === null) {
    return { ...EMPTY_RESULT, monthlyBase, extra: { monthlyGoal: goal } }
  }

  const overage = Math.max(0, actualCollections - goal)
  const bands = tieredBands(params)
  const bonusEarned = calcTierBonus(bands, overage, method)
  const totalComp = monthlyBase + bonusEarned

  return {
    bonus: bonusEarned,
    totalComp,
    annualComp: totalComp * 12,
    costPct: safeDiv(totalComp, actualCollections),
    belowGoal: actualCollections < goal,
    note: null,
    monthlyBase,
    extra: { monthlyGoal: goal, tiers: params.tiers, method },
  }
}
