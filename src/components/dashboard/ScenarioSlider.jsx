import { useApp } from '../../AppContext'
import { STRUCTURES } from '../../constants/structures'
import { calculate, getTargetPct } from '../../utils/calculations'
import { rowVerdict } from '../../utils/verdict'
import { fmtCurrency, fmtMetric, fmtPct } from '../../utils/format'
import VerdictBadge from '../shared/VerdictBadge'

export default function ScenarioSlider() {
  const { structureType, parameters, sliderValue, setSliderValue, goal } = useApp()
  const structure = STRUCTURES[structureType]

  if (!goal || goal <= 0) return null

  const max = Math.round(goal * 3)
  const current = sliderValue === null ? goal : sliderValue
  const targetPct = getTargetPct(structureType, parameters)
  const result = calculate(structureType, parameters, current)
  const verdict = result ? rowVerdict(result.costPct, targetPct) : null
  const isCurrency = structure.metric.format !== 'number'

  return (
    <div className="no-print rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-navy">Live Preview</h2>
        <span className="text-xs text-navy/50">
          Drag to model any {structure.metric.label.toLowerCase()}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={max}
        step={Math.max(1, Math.round(max / 200))}
        value={current}
        onChange={(e) => setSliderValue(Number(e.target.value))}
        className="w-full accent-gold"
      />
      <div className="mt-1 flex justify-between text-[11px] text-navy/40">
        <span>{isCurrency ? fmtCurrency(0) : 0}</span>
        <span>{fmtMetric(max, structure.metric.format)}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label={structure.metric.label} value={fmtMetric(current, structure.metric.format)} />
        <Stat label="Bonus" value={fmtCurrency(result?.bonus)} />
        <Stat label="Total / mo" value={fmtCurrency(result?.totalComp)} strong />
        <Stat label="Cost %" value={fmtPct(result?.costPct)} />
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-navy/40">Verdict</span>
          <div className="mt-1">
            <VerdictBadge verdict={verdict} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, strong }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-navy/40">{label}</span>
      <span
        className={`tabular mt-1 text-sm ${strong ? 'font-bold text-navy' : 'font-medium text-navy/80'}`}
      >
        {value}
      </span>
    </div>
  )
}
