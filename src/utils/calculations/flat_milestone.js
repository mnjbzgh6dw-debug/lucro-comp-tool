import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'

const isCollections = (params) => params.milestoneType === 'Collections Target'

// At-goal metric = the (first) milestone target.
export function monthlyGoal(params) {
  return reqNum(params.milestoneTarget)
}

export function calc(params, metricValue) {
  const monthlyBase = reqNum(params.baseSalary)
  const milestone = reqNum(params.milestoneTarget)
  const bonusAmount = reqNum(params.bonusAmount)
  const performance = num(metricValue)
  if (monthlyBase === null || milestone === null || performance === null) {
    return { ...EMPTY_RESULT, monthlyBase, extra: { milestone } }
  }

  let bonusEarned = performance >= milestone ? bonusAmount ?? 0 : 0
  // Optional stretch milestone pays its bonus instead (the higher tier).
  const stretchTarget = reqNum(params.stretchTarget)
  const stretchBonus = reqNum(params.stretchBonus)
  if (params.hasStretch && stretchTarget !== null && stretchBonus !== null) {
    if (performance >= stretchTarget) bonusEarned = stretchBonus
  }

  const totalComp = monthlyBase + bonusEarned
  // Cost % only meaningful when the milestone is collections-denominated.
  const costPct = isCollections(params) ? safeDiv(totalComp, performance) : null

  return {
    bonus: bonusEarned,
    totalComp,
    annualComp: totalComp * 12,
    costPct,
    belowGoal: performance < milestone,
    note: isCollections(params)
      ? null
      : 'Visit-target milestone — cost % not derivable from inputs.',
    monthlyBase,
    extra: { milestone, bonusAmount, stretchTarget, stretchBonus, isCollections: isCollections(params) },
  }
}
