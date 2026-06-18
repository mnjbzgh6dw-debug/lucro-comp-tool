import { useApp } from '../../AppContext'
import { useComputedScenarios } from '../../utils/useComputedScenarios'
import { buildSummary } from '../../utils/verdict'
import { buildTalkingPoints } from '../../utils/talkingPoints'
import { fmtCurrency, fmtMetric, fmtPct, fmtParam } from '../../utils/format'
import CompChart from '../dashboard/CompChart'
import Logo from '../shared/Logo'

const SectionTitle = ({ children }) => (
  <h2 className="mb-1.5 mt-3 border-b border-navy/20 pb-0.5 font-display text-[11px] font-bold uppercase tracking-wide text-navy">
    {children}
  </h2>
)

export default function PrintLayout() {
  const { profile, structureType, parameters } = useApp()
  const { rows, atGoalRow, targetPct, structure } = useComputedScenarios()

  const summary = buildSummary({
    name: profile.teamMemberName,
    costPct: atGoalRow?.result?.costPct ?? null,
    targetPct,
  })

  const points = atGoalRow?.result
    ? buildTalkingPoints(structureType, {
        name: profile.teamMemberName,
        params: parameters,
        result: atGoalRow.result,
        metricValue: atGoalRow.metricNumber,
      })
    : []

  const visibleFields = structure.fields.filter(
    (f) => f.type !== 'tiers' && (!f.showIf || f.showIf(parameters))
  )
  const v = atGoalRow?.verdict

  return (
    <div className="print-page mx-auto w-[190mm] max-w-full bg-white p-6 font-body text-navy print:w-full print:p-0">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-navy pb-2">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-auto" wordmarkClass="text-2xl" dark />
        </div>
        <div className="text-right">
          <h1 className="font-display text-lg font-bold text-navy">
            Compensation Summary
          </h1>
          <p className="text-[10px] text-navy/60">{structure.name}</p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-6 text-[11px]">
        <div>
          <span className="text-navy/50">Practice: </span>
          <span className="font-semibold">{profile.practiceName || '—'}</span>
        </div>
        <div>
          <span className="text-navy/50">Team Member: </span>
          <span className="font-semibold">{profile.teamMemberName || '—'}</span>
        </div>
        <div>
          <span className="text-navy/50">Role: </span>
          <span className="font-semibold">{profile.role || '—'}</span>
        </div>
        <div>
          <span className="text-navy/50">Date: </span>
          <span className="font-semibold">{profile.date || '—'}</span>
        </div>
      </div>

      {/* Key parameters */}
      <SectionTitle>Key Parameters</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[10.5px]">
        {visibleFields.map((f) => (
          <div key={f.key} className="flex justify-between border-b border-navy/5 py-0.5">
            <span className="text-navy/60">{f.label}</span>
            <span className="tabular font-semibold">{fmtParam(f, parameters)}</span>
          </div>
        ))}
        {Array.isArray(parameters.tiers) &&
          parameters.tiers.map((t, i) => (
            <div key={`t${i}`} className="flex justify-between border-b border-navy/5 py-0.5">
              <span className="text-navy/60">Tier {i + 1} ≤ {fmtCurrency(t.upper)}</span>
              <span className="tabular font-semibold">{t.pct}%</span>
            </div>
          ))}
      </div>

      {/* Scenario analysis */}
      <SectionTitle>Scenario Analysis</SectionTitle>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-navy/30 text-left text-navy/60">
            <th className="py-0.5 pr-2 font-semibold">Scenario</th>
            <th className="py-0.5 pr-2 font-semibold">{structure.metric.label}</th>
            <th className="py-0.5 pr-2 text-right font-semibold">Bonus</th>
            <th className="py-0.5 pr-2 text-right font-semibold">Total/mo</th>
            <th className="py-0.5 pr-2 text-right font-semibold">Annual</th>
            <th className="py-0.5 pr-2 text-right font-semibold">Cost %</th>
            <th className="py-0.5 font-semibold">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-navy/10">
              <td className="py-0.5 pr-2 font-medium">
                {r.label || '—'}
                {r.belowGoal && <span className="text-navy/40"> (below goal)</span>}
              </td>
              <td className="tabular py-0.5 pr-2">
                {fmtMetric(r.metricNumber, structure.metric.format)}
              </td>
              <td className="tabular py-0.5 pr-2 text-right">{fmtCurrency(r.result?.bonus)}</td>
              <td className="tabular py-0.5 pr-2 text-right font-semibold">
                {fmtCurrency(r.result?.totalComp)}
              </td>
              <td className="tabular py-0.5 pr-2 text-right">{fmtCurrency(r.result?.annualComp)}</td>
              <td className="tabular py-0.5 pr-2 text-right">{fmtPct(r.result?.costPct)}</td>
              <td className="py-0.5">
                {r.verdict?.icon} {r.verdict?.label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex justify-center">
        <CompChart width={560} height={200} forPrint />
      </div>

      {/* Verdict */}
      <SectionTitle>Sustainability Verdict</SectionTitle>
      <p className="text-[10.5px] leading-snug">
        <span className="font-bold">
          {v?.icon} {v?.label}
        </span>{' '}
        — {summary}
      </p>

      {/* Talking points */}
      <SectionTitle>Conversation Talking Points</SectionTitle>
      <ul className="space-y-0.5 text-[10.5px] leading-snug">
        {points.map((p, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="font-bold text-gold">•</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-4 border-t border-navy/20 pt-1 text-center text-[9px] text-navy/50">
        Confidential · Prepared by Lucro Financial · morelucro.com
      </div>
    </div>
  )
}
