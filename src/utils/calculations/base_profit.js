import { num, reqNum, safeDiv, monthlyBaseFrom, EMPTY_RESULT } from './_helpers'

// At-goal metric is the profit threshold (bonus kicks in above it).
export function monthlyGoal(params) {
  return reqNum(params.profitThreshold)
}

export function calc(params, metricValue) {
  const monthlyBase = monthlyBaseFrom(params.baseSalary, params.salaryType)
  const threshold = reqNum(params.profitThreshold)
  const monthlyCollections = reqNum(params.monthlyCollections)
  const monthlyNetProfit = num(metricValue)
  if (monthlyBase === null || threshold === null || monthlyNetProfit === null) {
    return { ...EMPTY_RESULT, monthlyBase, extra: { profitThreshold: threshold } }
  }

  const profitOverage = Math.max(0, monthlyNetProfit - threshold)
  const bonusPct = reqNum(params.bonusPct) ?? 0
  const bonus = profitOverage * (bonusPct / 100)
  const totalComp = monthlyBase + bonus
  const costPct = safeDiv(totalComp, monthlyCollections)
  const belowGoal = monthlyNetProfit < threshold

  return {
    bonus,
    totalComp,
    annualComp: totalComp * 12,
    costPct,
    belowGoal,
    note: null,
    monthlyBase,
    extra: { profitThreshold: threshold, profitOverage, bonusPct, monthlyCollections },
  }
}
