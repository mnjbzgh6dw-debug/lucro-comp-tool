import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'

// At-goal metric = the practice's stated gross monthly revenue.
export function monthlyGoal(params) {
  return reqNum(params.practiceRevenue)
}

export function calc(params, metricValue) {
  const sharePct = reqNum(params.sharePct)
  const practiceRevenue = num(metricValue)
  if (sharePct === null || practiceRevenue === null) {
    return { ...EMPTY_RESULT, monthlyBase: 0 }
  }

  const shareAmount = practiceRevenue * (sharePct / 100)
  const monthlyBase = params.hasBase ? reqNum(params.baseSalary) ?? 0 : 0
  const totalComp = monthlyBase + shareAmount

  return {
    bonus: shareAmount,
    totalComp,
    annualComp: totalComp * 12,
    costPct: safeDiv(totalComp, practiceRevenue),
    belowGoal: false,
    note: null,
    monthlyBase,
    extra: { sharePct, shareAmount, hasBase: !!params.hasBase },
  }
}
