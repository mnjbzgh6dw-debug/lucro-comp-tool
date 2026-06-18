import { useMemo } from 'react'
import { useApp } from '../AppContext'
import { STRUCTURES } from '../constants/structures'
import { calculate, getTargetPct } from './calculations'
import { rowVerdict } from './verdict'

// Derives the fully-computed scenario rows (result + verdict) from app state.
// Shared by the table, chart, verdict panel and print layout.
export function useComputedScenarios() {
  const { structureType, parameters, scenarios, expectedValue } = useApp()
  const structure = STRUCTURES[structureType]
  const targetPct = getTargetPct(structureType, parameters)

  return useMemo(() => {
    const rows = scenarios.map((s) => {
      const metric = s.metricValue === '' ? null : Number(s.metricValue)
      const result = calculate(structureType, parameters, s.metricValue)
      const verdict = result ? rowVerdict(result.costPct, targetPct) : null
      return {
        id: s.id,
        label: s.label,
        locked: s.locked,
        metricValue: s.metricValue,
        metricNumber: metric,
        result,
        verdict,
        belowGoal: !!result?.belowGoal,
      }
    })

    // Highlight the row closest to the user's expected monthly figure.
    let highlightId = null
    const expected = Number(expectedValue)
    if (Number.isFinite(expected) && expected > 0) {
      let best = Infinity
      for (const r of rows) {
        if (r.metricNumber === null) continue
        const d = Math.abs(r.metricNumber - expected)
        if (d < best) {
          best = d
          highlightId = r.id
        }
      }
    }

    const atGoalRow = rows.find((r) => r.locked) || rows[0] || null

    return { rows, atGoalRow, highlightId, structure, targetPct }
  }, [scenarios, structureType, parameters, targetPct, expectedValue, structure])
}
