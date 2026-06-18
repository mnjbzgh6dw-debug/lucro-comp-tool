import { useState } from 'react'
import { useApp } from '../../AppContext'
import { useComputedScenarios } from '../../utils/useComputedScenarios'
import { buildTalkingPoints } from '../../utils/talkingPoints'

export default function TalkingPoints() {
  const { profile, structureType, parameters } = useApp()
  const { rows, atGoalRow, highlightId } = useComputedScenarios()
  const [open, setOpen] = useState(true)

  // Anchor the points on the highlighted (expected) row, else At Goal.
  const primary = rows.find((r) => r.id === highlightId) || atGoalRow
  const points = primary?.result
    ? buildTalkingPoints(structureType, {
        name: profile.teamMemberName,
        params: parameters,
        result: primary.result,
        metricValue: primary.metricNumber,
      })
    : []

  return (
    <div className="rounded-2xl border border-navy/10 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3"
      >
        <h2 className="font-display text-base font-bold text-navy">
          Conversation Talking Points
        </h2>
        <span className="text-sm text-navy/50">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ul className="space-y-2 px-5 pb-4">
          {points.length === 0 && (
            <li className="text-sm text-navy/50">
              Complete the parameters to generate talking points.
            </li>
          )}
          {points.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-navy/80">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
