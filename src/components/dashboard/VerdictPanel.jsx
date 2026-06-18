import { useApp } from '../../AppContext'
import { useComputedScenarios } from '../../utils/useComputedScenarios'
import { buildSummary } from '../../utils/verdict'
import VerdictBadge from '../shared/VerdictBadge'

export default function VerdictPanel() {
  const { profile } = useApp()
  const { atGoalRow, targetPct } = useComputedScenarios()
  if (!atGoalRow) return null

  const summary = buildSummary({
    name: profile.teamMemberName,
    costPct: atGoalRow.result?.costPct ?? null,
    targetPct,
  })

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-navy">
          Sustainability Verdict
        </h2>
        <VerdictBadge verdict={atGoalRow.verdict} size="lg" />
      </div>
      <p className="text-sm leading-relaxed text-navy/80">{summary}</p>
      {atGoalRow.verdict?.note && (
        <p className="mt-2 text-sm font-semibold text-red">{atGoalRow.verdict.note}</p>
      )}
    </div>
  )
}
