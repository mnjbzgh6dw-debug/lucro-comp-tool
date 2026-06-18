import { num, reqNum, safeDiv, EMPTY_RESULT } from './_helpers'

// Required collections to hit the target take-home.
export function requiredCollections(params) {
  const targetComp = reqNum(params.targetComp)
  const pct = reqNum(params.collectionsPct)
  if (targetComp === null || pct === null) return null
  return targetComp / (pct / 100)
}

// At-goal metric = collections needed to reach the target take-home.
export function monthlyGoal(params) {
  return requiredCollections(params)
}

export function calc(params, metricValue) {
  const pct = reqNum(params.collectionsPct)
  const actualCollections = num(metricValue)
  if (pct === null || actualCollections === null) {
    return { ...EMPTY_RESULT }
  }

  const earnedComp = actualCollections * (pct / 100)
  const avgPerVisit = reqNum(params.avgPerVisit)
  const targetComp = reqNum(params.targetComp)
  const visitsNeeded = safeDiv(targetComp, avgPerVisit)
  const reqColl = requiredCollections(params)

  return {
    bonus: earnedComp, // no base — entire comp is "earned"
    totalComp: earnedComp,
    annualComp: earnedComp * 12,
    costPct: pct / 100, // cost % is exactly the collections %
    belowGoal: reqColl !== null && actualCollections < reqColl,
    note: null,
    monthlyBase: 0,
    extra: {
      collectionsPct: pct,
      requiredCollections: reqColl,
      visitsNeeded,
      targetComp,
      avgPerVisit,
    },
  }
}
