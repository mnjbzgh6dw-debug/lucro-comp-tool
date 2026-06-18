// Dispatcher for the calculation engine. Each structure module exports:
//   calc(params, metricValue) -> normalized result
//   monthlyGoal(params)       -> the "At Goal" key-metric value
import { DEFAULT_TARGET_PCT } from '../../constants/structures'
import * as base_collections from './base_collections'
import * as base_profit from './base_profit'
import * as collections_only from './collections_only'
import * as tiered_collections from './tiered_collections'
import * as per_visit from './per_visit'
import * as flat_milestone from './flat_milestone'
import * as hybrid_two_tier from './hybrid_two_tier'
import * as revenue_share from './revenue_share'

const ENGINES = {
  base_collections,
  base_profit,
  collections_only,
  tiered_collections,
  per_visit,
  flat_milestone,
  hybrid_two_tier,
  revenue_share,
}

/** Run a structure's formula for a given scenario key-metric value. */
export function calculate(structureType, params, metricValue) {
  const engine = ENGINES[structureType]
  if (!engine) return null
  return engine.calc(params, metricValue)
}

/** The "At Goal" / floor metric value for a structure (used to seed Row 1). */
export function getMonthlyGoal(structureType, params) {
  const engine = ENGINES[structureType]
  if (!engine || !engine.monthlyGoal) return null
  return engine.monthlyGoal(params)
}

/**
 * The target cost % used by the verdict for this structure.
 * Only base_collections carries an explicit target; everyone else
 * falls back to the default threshold (30%).
 */
export function getTargetPct(structureType, params) {
  if (structureType === 'base_collections') {
    const t = Number(params.targetPct)
    if (Number.isFinite(t) && t > 0) return t
  }
  return DEFAULT_TARGET_PCT
}

/** Tier-overlap validation (only tiered_collections has it). */
export function validateStructure(structureType, params) {
  if (structureType === 'tiered_collections') {
    return tiered_collections.validateTiers(params)
  }
  return null
}
