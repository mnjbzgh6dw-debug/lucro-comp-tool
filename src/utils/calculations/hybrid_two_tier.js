import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'
import { calcTierBonus, hybridBands } from './_tierCalc'

export function monthlyGoal(params) {
  return reqNum(params.monthlyGoal)
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
  const bands = hybridBands(params)
  const bonus = calcTierBonus(bands, overage, method)
  const totalComp = monthlyBase + bonus
  const tier1Cap = reqNum(params.tier1Cap) ?? 0

  return {
    bonus,
    totalComp,
    annualComp: totalComp * 12,
    costPct: safeDiv(totalComp, actualCollections),
    belowGoal: actualCollections < goal,
    note: null,
    monthlyBase,
    extra: {
      monthlyGoal: goal,
      overage,
      tier1Cap,
      tier1Pct: reqNum(params.tier1Pct) ?? 0,
      tier2Pct: reqNum(params.tier2Pct) ?? 0,
      tier2Threshold: goal + tier1Cap,
      method,
    },
  }
}
