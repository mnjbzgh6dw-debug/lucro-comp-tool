import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'

export function monthlyGoal(params) {
  return reqNum(params.monthlyGoal)
}

export function calc(params, metricValue) {
  const monthlyBase = reqNum(params.baseSalary)
  const goal = reqNum(params.monthlyGoal)
  const actualCollections = num(metricValue)
  if (monthlyBase === null || goal === null || actualCollections === null) {
    return { ...EMPTY_RESULT, monthlyBase, extra: { monthlyGoal: goal } }
  }

  const overage = Math.max(0, actualCollections - goal)
  const tier1Cap = reqNum(params.tier1Cap) ?? 0
  const tier1Pct = reqNum(params.tier1Pct) ?? 0
  const tier2Pct = reqNum(params.tier2Pct) ?? 0
  const tier1Amount = Math.min(overage, tier1Cap)
  const tier2Amount = Math.max(0, overage - tier1Cap)
  const bonus = tier1Amount * (tier1Pct / 100) + tier2Amount * (tier2Pct / 100)
  const totalComp = monthlyBase + bonus

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
      tier1Pct,
      tier2Pct,
      tier2Threshold: goal + tier1Cap,
    },
  }
}
