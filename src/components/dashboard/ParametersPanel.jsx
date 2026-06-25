import { useState } from 'react'
import { useApp } from '../../AppContext'
import { STRUCTURES } from '../../constants/structures'
import { getMonthlyGoal } from '../../utils/calculations'
import { fmtCurrency, fmtNumber, fmtParam } from '../../utils/format'

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-sm text-navy/60">{label}</span>
      <span className="tabular text-sm font-semibold text-blue-700">{value}</span>
    </div>
  )
}

export default function ParametersPanel() {
  const { profile, structureType, parameters, goToStep } = useApp()
  const [open, setOpen] = useState(true)
  const structure = STRUCTURES[structureType]
  const goal = getMonthlyGoal(structureType, parameters)

  const visibleFields = structure.fields.filter(
    (f) => f.type !== 'tiers' && (!f.showIf || f.showIf(parameters))
  )
  const tierField = structure.fields.find((f) => f.type === 'tiers')

  return (
    <aside className="rounded-2xl border border-navy/10 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-navy/10 px-5 py-3">
        <h2 className="font-display text-base font-bold text-navy">Parameters</h2>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-sm text-navy/50 hover:text-navy"
        >
          {open ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {open && (
        <div className="space-y-4 px-5 py-4">
          {/* Profile */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy/40">
                Profile
              </h3>
              <button
                onClick={() => goToStep(1)}
                className="text-xs font-semibold text-gold hover:underline"
              >
                Edit
              </button>
            </div>
            <Row label="Practice" value={profile.practiceName || '—'} />
            <Row label="Team Member" value={profile.teamMemberName || '—'} />
            <Row label="Role" value={profile.role || '—'} />
            <Row label="Date" value={profile.date || '—'} />
          </div>

          {/* Structure */}
          <div className="border-t border-navy/10 pt-3">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy/40">
                Structure
              </h3>
              <button
                onClick={() => goToStep(2)}
                className="text-xs font-semibold text-gold hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="text-sm font-semibold text-blue-700">{structure.name}</p>
          </div>

          {/* Parameters */}
          <div className="border-t border-navy/10 pt-3">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy/40">
                Inputs
              </h3>
              <button
                onClick={() => goToStep(3)}
                className="text-xs font-semibold text-gold hover:underline"
              >
                Edit
              </button>
            </div>
            {visibleFields.map((f) => (
              <Row key={f.key} label={f.label} value={fmtParam(f, parameters)} />
            ))}

            {tierField && Array.isArray(parameters.tiers) && (
              <div className="pt-1">
                <span className="text-sm text-navy/60">Tiers</span>
                <div className="mt-1 space-y-0.5">
                  {parameters.tiers.map((t, i) => (
                    <div
                      key={i}
                      className="tabular flex justify-between text-sm font-semibold text-blue-700"
                    >
                      <span>Tier {i + 1} ≤ {fmtCurrency(t.upper)}</span>
                      <span>{fmtNumber(t.pct)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calculated (black = output) */}
          <div className="rounded-lg bg-light-navy px-3 py-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-navy/60">Monthly goal / floor</span>
              <span className="tabular text-sm font-bold text-navy">
                {structure.metric.format === 'number'
                  ? fmtNumber(goal)
                  : fmtCurrency(goal)}
              </span>
            </div>
          </div>

          <p className="text-[11px] leading-snug text-navy/40">
            <span className="font-semibold text-blue-700">Blue</span> = your inputs ·{' '}
            <span className="font-semibold text-navy">Black</span> = calculated.
            {' '}The monthly goal is derived from your inputs — not set directly.
          </p>
        </div>
      )}
    </aside>
  )
}
