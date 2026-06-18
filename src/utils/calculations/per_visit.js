import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'

// At-goal metric = the baseline estimated visits per month.
export function monthlyGoal(params) {
  return reqNum(params.visitsPerMonth)
}

export function calc(params, metricValue) {
  const visitRate = reqNum(params.visitRate)
  const actualVisits = num(metricValue)
  const avgPerVisit = reqNum(params.avgPerVisit)
  if (visitRate === null || actualVisits === null) {
    return { ...EMPTY_RESULT, monthlyBase: 0 }
  }

  const earnedComp = visitRate * actualVisits
  const collectionsGenerated =
    avgPerVisit !== null ? actualVisits * avgPerVisit : null
  const costPct = safeDiv(earnedComp, collectionsGenerated)

  return {
    bonus: earnedComp, // no base — all comp is the per-visit earning
    totalComp: earnedComp,
    annualComp: earnedComp * 12,
    costPct,
    belowGoal: false,
    note: null,
    monthlyBase: 0,
    extra: { visitRate, avgPerVisit, collectionsGenerated },
  }
}
