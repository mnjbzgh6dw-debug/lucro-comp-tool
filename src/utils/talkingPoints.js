import { fmtCurrency, fmtNumber, fmtPct } from './format'

// Build 3–5 conversation talking points per structure, with real values
// interpolated. `ctx` carries the primary (highlighted or At-Goal) scenario.
//   ctx = { name, params, result, metricValue }
// All numbers route through the formatters, so missing inputs read as "—".

const nameOf = (ctx) => ctx.name?.trim() || 'Your team member'

const BUILDERS = {
  base_collections(ctx) {
    const { params, result, metricValue } = ctx
    const name = nameOf(ctx)
    const goal = result.extra.monthlyGoal
    const avg = Number(params.avgPerVisit)
    const period = params.visitPeriod === 'Week' ? 'week' : 'month'
    let visitsNeeded = null
    if (goal && Number.isFinite(avg) && avg > 0) {
      visitsNeeded = goal / avg
      if (period === 'week') visitsNeeded = visitsNeeded / 4.33
    }
    return [
      `${name}'s base of ${fmtCurrency(result.monthlyBase)}/month is justified when monthly collections reach ${fmtCurrency(goal)} — that's about ${fmtNumber(visitsNeeded)} visits a ${period} at your current average.`,
      `For every dollar collected above ${fmtCurrency(goal)}, ${name} earns ${fmtNumber(params.bonusPct)}¢ as a bonus — strong months reward both of you.`,
      `At ${fmtCurrency(metricValue)} collections, ${name} takes home ${fmtCurrency(result.totalComp)} — ${fmtPct(result.costPct)} of what the practice brings in.`,
      `The goal isn't a ceiling — it's the floor. Everything above it is shared growth.`,
    ]
  },

  base_profit(ctx) {
    const { params, result, metricValue } = ctx
    const name = nameOf(ctx)
    return [
      `${name}'s base of ${fmtCurrency(result.monthlyBase)}/month comes with a bonus of ${fmtNumber(params.bonusPct)}% on every dollar of net profit above ${fmtCurrency(result.extra.profitThreshold)}.`,
      `This rewards efficiency, not just top-line — ${name} benefits directly when the practice runs lean.`,
      `At ${fmtCurrency(metricValue)} of monthly profit, the bonus is ${fmtCurrency(result.bonus)}, bringing total comp to ${fmtCurrency(result.totalComp)}.`,
      `Against ${fmtCurrency(result.extra.monthlyCollections)} in collections, that's ${fmtPct(result.costPct)} of what the practice brings in.`,
    ]
  },

  collections_only(ctx) {
    const { params, result } = ctx
    const name = nameOf(ctx)
    const avg = Number(params.avgPerVisit)
    const req = result.extra.requiredCollections
    const period = params.visitPeriod === 'Week' ? 'week' : 'month'
    let visitsForTarget = null
    if (req && Number.isFinite(avg) && avg > 0) {
      visitsForTarget = req / avg
      if (period === 'week') visitsForTarget = visitsForTarget / 4.33
    }
    return [
      `To take home ${fmtCurrency(params.targetComp)} a month, ${name} needs to bring in ${fmtCurrency(req)} in collections — about ${fmtNumber(visitsForTarget)} visits a ${period} at your current average.`,
      `There's no guaranteed salary — ${name} earns exactly ${fmtNumber(params.collectionsPct)}% of what they produce.`,
      `Every patient seen flows straight into ${name}'s paycheck — incentives are fully aligned with production.`,
      `The trade-off is no floor: slow months are lean, but strong months are uncapped.`,
    ]
  },

  tiered_collections(ctx) {
    const { params, result } = ctx
    const name = nameOf(ctx)
    const tiers = Array.isArray(params.tiers) ? params.tiers : []
    const t1 = tiers[0] || {}
    const t2 = tiers[1] || tiers[0] || {}
    return [
      `The tiers reward momentum. The more ${name} produces, the higher the rate on every additional dollar.`,
      `At ${fmtCurrency(t1.upper)}, the bonus rate steps up from ${fmtNumber(t1.pct)}% to ${fmtNumber(t2.pct)}% — that's the stretch target worth pushing for.`,
      `${name}'s base of ${fmtCurrency(result.monthlyBase)} is the floor; the bands above ${fmtCurrency(result.extra.monthlyGoal)} are pure shared upside.`,
      `Because the rate climbs, the cost of each bonus dollar is earned by collections that already cleared the goal.`,
    ]
  },

  per_visit(ctx) {
    const { params, result, metricValue } = ctx
    const name = nameOf(ctx)
    return [
      `${name} earns ${fmtCurrency(params.visitRate)} per visit — at ${fmtNumber(metricValue)} visits that's ${fmtCurrency(result.totalComp)} for the month.`,
      `Comp scales 1:1 with patient volume — busy months pay more, slow months cost the practice less.`,
      `At your average of ${fmtCurrency(params.avgPerVisit)} collected per visit, ${name}'s pay is ${fmtPct(result.costPct)} of what those visits bring in.`,
      `There's no base and no bonus to model — it's the simplest structure to explain and to budget.`,
    ]
  },

  flat_milestone(ctx) {
    const { params, result, metricValue } = ctx
    const name = nameOf(ctx)
    const tgtFmt = params.milestoneType === 'Collections Target' ? fmtCurrency : fmtNumber
    const points = [
      `${name}'s base of ${fmtCurrency(result.monthlyBase)} comes with a flat ${fmtCurrency(params.bonusAmount)} bonus when they hit ${tgtFmt(result.extra.milestone)}${params.milestoneType === 'Visit Target' ? ' visits' : ''}.`,
      `It's a clear, binary goal — hit the number, earn the bonus. No ambiguity to negotiate later.`,
    ]
    if (params.hasStretch) {
      points.push(
        `A stretch milestone at ${tgtFmt(result.extra.stretchTarget)}${params.milestoneType === 'Visit Target' ? ' visits' : ''} unlocks an extra ${fmtCurrency(result.extra.stretchBonus)} — upside without changing the base.`
      )
    }
    points.push(
      `At ${tgtFmt(metricValue)}${params.milestoneType === 'Visit Target' ? ' visits' : ''}, ${name}'s total comp is ${fmtCurrency(result.totalComp)}.`
    )
    return points
  },

  hybrid_two_tier(ctx) {
    const { params, result } = ctx
    const name = nameOf(ctx)
    const e = result.extra
    return [
      `${name}'s base of ${fmtCurrency(result.monthlyBase)} is justified once collections reach ${fmtCurrency(e.monthlyGoal)}.`,
      `The first ${fmtCurrency(e.tier1Cap)} of overage earns ${fmtNumber(e.tier1Pct)}%; beyond that the rate jumps to ${fmtNumber(e.tier2Pct)}%.`,
      `At ${fmtCurrency(e.tier2Threshold)} in collections the bonus rate escalates — that's the stretch worth pushing for.`,
      `The goal is the floor and the cap is the springboard — both reward the months that matter most.`,
    ]
  },

  revenue_share(ctx) {
    const { params, result, metricValue } = ctx
    const name = nameOf(ctx)
    return [
      `${name} earns ${fmtNumber(params.sharePct)}% of total gross practice revenue — comp is tied to the whole practice's performance, not just their own production.`,
      params.hasBase
        ? `A base of ${fmtCurrency(result.monthlyBase)} provides stability, with the revenue share layered on top.`
        : `There's no base salary — ${name}'s entire comp is the revenue share, fully variable with the practice.`,
      `At ${fmtCurrency(metricValue)} in gross revenue, that's ${fmtCurrency(result.totalComp)} total — ${fmtPct(result.costPct)} of gross.`,
      `This aligns ${name} with overall practice growth, not just the patients they personally see.`,
    ]
  },
}

export function buildTalkingPoints(structureType, ctx) {
  const builder = BUILDERS[structureType]
  if (!builder || !ctx?.result) return []
  return builder(ctx).filter(Boolean)
}
