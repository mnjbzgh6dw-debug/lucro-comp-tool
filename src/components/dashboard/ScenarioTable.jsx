import { useApp } from '../../AppContext'
import { useComputedScenarios } from '../../utils/useComputedScenarios'
import { fmtCurrency, fmtMetric, fmtPct } from '../../utils/format'
import CurrencyInput from '../shared/CurrencyInput'
import VerdictBadge from '../shared/VerdictBadge'

export default function ScenarioTable() {
  const {
    scenarios,
    addScenario,
    updateScenario,
    removeScenario,
    expectedValue,
    setExpectedValue,
    structureType,
    parameters,
  } = useApp()
  const { rows, highlightId, structure } = useComputedScenarios()

  const metricFormat = structure.metric.format
  const metricIsCurrency =
    metricFormat === 'currency' ||
    (metricFormat === 'auto' && parameters.milestoneType === 'Collections Target')

  return (
    <div className="rounded-2xl border border-navy/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-5 py-3">
        <h2 className="font-display text-base font-bold text-navy">Scenario Builder</h2>
        <label className="no-print flex items-center gap-2 text-sm text-navy/60">
          Expected month
          <input
            type="number"
            value={expectedValue}
            onChange={(e) =>
              setExpectedValue(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="—"
            className="tabular w-28 rounded-lg border border-navy/15 bg-light-gold px-2 py-1 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-navy/50">
              <th className="px-4 py-2 font-semibold">Scenario</th>
              <th className="px-4 py-2 font-semibold">{structure.metric.label}</th>
              <th className="px-4 py-2 text-right font-semibold">Bonus</th>
              <th className="px-4 py-2 text-right font-semibold">Total / mo</th>
              <th className="px-4 py-2 text-right font-semibold">Annualised</th>
              <th className="px-4 py-2 text-right font-semibold">Cost %</th>
              <th className="px-4 py-2 font-semibold">Verdict</th>
              <th className="no-print px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const scenario = scenarios.find((s) => s.id === row.id)
              const highlighted = row.id === highlightId
              const r = row.result || {}
              return (
                <tr
                  key={row.id}
                  className={`border-b border-navy/5 ${
                    highlighted ? 'bg-light-gold' : ''
                  }`}
                >
                  {/* Label */}
                  <td className="px-4 py-2">
                    {row.locked ? (
                      <span className="font-semibold text-navy">{row.label}</span>
                    ) : (
                      <input
                        value={scenario?.label ?? ''}
                        onChange={(e) =>
                          updateScenario(row.id, { label: e.target.value })
                        }
                        placeholder="Scenario name"
                        className="no-print w-32 rounded border border-navy/15 bg-light-gold px-2 py-1 text-navy outline-none focus:border-gold"
                      />
                    )}
                    {row.belowGoal && (
                      <span className="ml-2 rounded bg-navy/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-navy/60">
                        Below Goal
                      </span>
                    )}
                  </td>

                  {/* Key metric */}
                  <td className="px-4 py-2">
                    {row.locked ? (
                      <span className="tabular font-medium text-navy">
                        {fmtMetric(row.metricNumber, metricFormat)}
                      </span>
                    ) : metricIsCurrency ? (
                      <div className="no-print w-32">
                        <CurrencyInput
                          value={scenario?.metricValue ?? ''}
                          onChange={(v) => updateScenario(row.id, { metricValue: v })}
                        />
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={scenario?.metricValue ?? ''}
                        onChange={(e) =>
                          updateScenario(row.id, {
                            metricValue:
                              e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        className="no-print tabular w-24 rounded border border-navy/15 bg-light-gold px-2 py-1 text-navy outline-none focus:border-gold"
                      />
                    )}
                    {/* Print-friendly static metric value */}
                    <span className="print-only tabular font-medium text-navy">
                      {fmtMetric(row.metricNumber, metricFormat)}
                    </span>
                  </td>

                  <td className="tabular px-4 py-2 text-right text-navy">
                    {fmtCurrency(r.bonus)}
                  </td>
                  <td className="tabular px-4 py-2 text-right font-semibold text-navy">
                    {fmtCurrency(r.totalComp)}
                  </td>
                  <td className="tabular px-4 py-2 text-right text-navy">
                    {fmtCurrency(r.annualComp)}
                  </td>
                  <td className="tabular px-4 py-2 text-right text-navy">
                    {fmtPct(r.costPct)}
                  </td>
                  <td className="px-4 py-2">
                    <VerdictBadge verdict={row.verdict} />
                  </td>

                  {/* Remove */}
                  <td className="no-print px-2 py-2">
                    {!row.locked && (
                      <button
                        onClick={() => removeScenario(row.id)}
                        className="rounded px-2 py-1 text-red hover:bg-red/10"
                        aria-label="Remove scenario"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="no-print px-5 py-3">
        <button
          onClick={addScenario}
          disabled={scenarios.length >= 8}
          className="rounded-lg border border-dashed border-navy/30 px-4 py-2 text-sm font-medium text-navy/70 transition hover:border-gold hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add Scenario {scenarios.length >= 8 && '(max 8)'}
        </button>
      </div>
    </div>
  )
}
