import { num, reqNum, safeDiv, monthlyBaseFrom, EMPTY_RESULT } from './_helpers'

// monthlyGoal = annualBase / targetPct / 12
export function monthlyGoal(params) {
  const monthlyBase = monthlyBaseFrom(params.baseSalary, params.salaryType)
  const targetPct = reqNum(params.targetPct)
  if (monthlyBase === null || targetPct === null) return null
  const annualBase = monthlyBase * 12
  return annualBase / (targetPct / 100) / 12
}

export function calc(params, metricValue) {
  const monthlyBase = monthlyBaseFrom(params.baseSalary, params.salaryType)
  const goal = monthlyGoal(params)
  const actualCollections = num(metricValue)
  if (monthlyBase === null || goal === null || actualCollections === null) {
    return { ...EMPTY_RESULT, monthlyBase, extra: { monthlyGoal: goal } }
  }

  const overage = Math.max(0, actualCollections - goal)
  const bonusPct = reqNum(params.bonusPct) ?? 0
  const bonus = overage * (bonusPct / 100)
  const totalComp = monthlyBase + bonus
  const costPct = safeDiv(totalComp, actualCollections)
  const belowGoal = actualCollections < goal

  return {
    bonus,
    totalComp,
    annualComp: totalComp * 12,
    costPct,
    belowGoal,
    note: null,
    monthlyBase,
    extra: { monthlyGoal: goal, overage, bonusPct },
  }
}
