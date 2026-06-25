import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../AppContext'
import { STRUCTURES } from '../../constants/structures'
import { validateStructure } from '../../utils/calculations'
import { calcTierBonus, tieredBands, hybridBands } from '../../utils/calculations/_tierCalc'
import { fmtCurrency, fmtNumber } from '../../utils/format'
import CurrencyInput from '../shared/CurrencyInput'
import Tooltip from '../shared/Tooltip'

const numClass =
  'tabular w-full rounded-lg border border-navy/15 bg-light-gold px-3 py-2 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40'

function Toggle({ field, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-navy/15 bg-white p-1">
      {field.options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function PercentSelect({ field, value, onChange }) {
  const opts = []
  for (let p = field.min; p <= field.max; p += field.step) opts.push(p)
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`${numClass} appearance-none`}
    >
      {opts.map((p) => (
        <option key={p} value={p}>
          {p}%
        </option>
      ))}
    </select>
  )
}

function TierBuilder({ value, onChange }) {
  const tiers = Array.isArray(value) ? value : []
  const update = (i, patch) =>
    onChange(tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))
  const add = () => {
    if (tiers.length >= 4) return
    onChange([...tiers, { upper: '', pct: 20 }])
  }
  const remove = (i) => onChange(tiers.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {tiers.map((t, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-12 text-xs font-medium text-navy/50">Tier {i + 1}</span>
          <div className="flex-1">
            <CurrencyInput
              value={t.upper}
              onChange={(v) => update(i, { upper: v })}
              placeholder="Upper bound"
            />
          </div>
          <div className="flex w-24 items-center">
            <input
              type="number"
              value={t.pct}
              onChange={(e) => update(i, { pct: Number(e.target.value) })}
              className={numClass}
            />
            <span className="ml-1 text-navy/50">%</span>
          </div>
          <button
            onClick={() => remove(i)}
            className="rounded-md px-2 py-1 text-sm text-red hover:bg-red/10"
            aria-label={`Remove tier ${i + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      {tiers.length < 4 && (
        <button
          onClick={add}
          className="rounded-lg border border-dashed border-navy/30 px-3 py-1.5 text-sm font-medium text-navy/70 hover:border-gold hover:text-navy"
        >
          + Add Tier
        </button>
      )}
    </div>
  )
}

function FieldRenderer({ field, params, updateParam }) {
  if (field.showIf && !field.showIf(params)) return null
  const value = params[field.key]
  const onChange = (v) => updateParam(field.key, v)

  let control
  switch (field.type) {
    case 'toggle':
      control = <Toggle field={field} value={value} onChange={onChange} />
      break
    case 'percentSelect':
      control = <PercentSelect field={field} value={value} onChange={onChange} />
      break
    case 'tiers':
      control = <TierBuilder value={value} onChange={onChange} />
      break
    case 'number':
      control = (
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onChange(e.target.value === '' ? '' : Number(e.target.value))
          }
          className={numClass}
        />
      )
      break
    case 'text':
      control = (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={numClass}
        />
      )
      break
    case 'currency':
    default: {
      // Some "currency" fields are plain counts depending on a sibling toggle.
      const asCurrency = field.currencyIf ? field.currencyIf(params) : true
      control = asCurrency ? (
        <CurrencyInput value={value} onChange={onChange} />
      ) : (
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onChange(e.target.value === '' ? '' : Number(e.target.value))
          }
          className={numClass}
        />
      )
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center text-sm font-medium text-navy/80">
        {field.label}
        {field.hint && <Tooltip text={field.hint} />}
      </div>
      {control}
    </div>
  )
}

function TierMethodExplainer({ structureType, parameters }) {
  const method = parameters.tierMethod || 'Cumulative'
  const prevMethod = useRef(method)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (prevMethod.current !== method) {
      prevMethod.current = method
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 2000)
      return () => clearTimeout(t)
    }
  }, [method])

  // Build bands and pick a representative example overage
  const bands = structureType === 'tiered_collections'
    ? tieredBands(parameters)
    : hybridBands(parameters)

  let exampleOverage = null
  if (bands.length >= 2) {
    const firstBand = bands[0]
    const secondBand = bands[1]
    // Pick midpoint of second band (or midpoint of first+10k if open-ended)
    const secondTo = secondBand.to === Infinity ? firstBand.to + 10000 : secondBand.to
    exampleOverage = Math.round((firstBand.to + secondTo) / 2 / 1000) * 1000
  } else if (bands.length === 1 && bands[0].to !== Infinity) {
    exampleOverage = Math.round(bands[0].to * 0.6 / 1000) * 1000
  }

  const cumPayout = exampleOverage ? calcTierBonus(bands, exampleOverage, 'Cumulative') : null
  const cliffPayout = exampleOverage ? calcTierBonus(bands, exampleOverage, 'Cliff') : null

  return (
    <div className="sm:col-span-2 rounded-xl border border-navy/10 bg-light-navy px-4 py-4 space-y-2 text-sm text-navy/80">
      <div className="flex items-center justify-between">
        <p>
          <span className="font-semibold">Cumulative</span> — each dollar of overage is paid at
          the rate for its own band, like a tax bracket. Crossing into a higher tier only changes
          the rate on the dollars <em>above</em> that threshold.
        </p>
      </div>
      <p>
        <span className="font-semibold">Cliff</span> — once total overage crosses a tier
        threshold, the entire overage is paid at that tier&apos;s rate, retroactively.
      </p>
      <p className="text-navy/55 text-xs">
        Cumulative is the more common approach and avoids a known issue with cliff structures:
        falling just short of a threshold can cost far more than the shortfall itself.
      </p>
      {exampleOverage !== null && cumPayout !== null && cliffPayout !== null && (
        <p className="border-t border-navy/10 pt-2 text-xs font-medium text-navy/70">
          For example, at {fmtCurrency(exampleOverage)} in overage, this would pay{' '}
          <span className="text-navy font-semibold">{fmtCurrency(cumPayout)}</span> under Cumulative
          {' '}vs.{' '}
          <span className="text-navy font-semibold">{fmtCurrency(cliffPayout)}</span> under Cliff.
        </p>
      )}
      {flash && (
        <p className="text-xs font-semibold text-gold animate-pulse">Scenarios recalculated</p>
      )}
    </div>
  )
}

export default function Step3Parameters() {
  const { structureType, parameters, updateParam } = useApp()
  const structure = STRUCTURES[structureType]
  const tierError = validateStructure(structureType, parameters)

  // Target % sanity warning (10–60% advisable range).
  let targetWarning = null
  if (structureType === 'base_collections') {
    const t = Number(parameters.targetPct)
    if (Number.isFinite(t) && (t < 10 || t > 60)) {
      targetWarning = `A salary-to-collections target of ${t}% is outside the usual 10–60% range — double-check this figure.`
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">Set your parameters</h2>
        <p className="mt-1 text-sm text-navy/60">
          {structure.name} — {structure.description}
        </p>
      </div>

      {structure.overview && (
        <div className="rounded-xl border border-gold/40 bg-light-gold px-4 py-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">Overview of Compensation Type</p>
          <p className="text-sm leading-relaxed text-navy/80">{structure.overview}</p>
        </div>
      )}

      {structureType === 'revenue_share' && (
        <div className="rounded-xl border border-amber/40 bg-amber/5 px-4 py-3">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-amber">Revenue vs. Collections</p>
          <p className="text-sm leading-relaxed text-navy/80">
            This model pays out on billed revenue, not cash actually collected. Revenue can include amounts later written off, denied by insurance, or never collected.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {structure.fields.flatMap((field) => {
          const el = (
            <div key={field.key} className={field.type === 'tiers' || field.fullWidth ? 'sm:col-span-2' : ''}>
              <FieldRenderer field={field} params={parameters} updateParam={updateParam} />
            </div>
          )
          if (field.key === 'tierMethod') {
            return [
              el,
              <TierMethodExplainer
                key="tier-explainer"
                structureType={structureType}
                parameters={parameters}
              />,
            ]
          }
          return [el]
        })}
      </div>

      {structureType === 'per_visit' && (() => {
        const rate = Number(parameters.visitRate)
        const avg = Number(parameters.avgPerVisit)
        const margin = rate > 0 && avg > 0 && avg > rate ? avg - rate : null
        const costPct = rate > 0 && avg > 0 ? (rate / avg) * 100 : null
        const keepPct = costPct !== null ? 100 - costPct : null
        return (
          <div className="rounded-xl border border-navy/15 bg-light-navy px-4 py-3">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-navy/50">Margin per visit</p>
            <p className="text-sm leading-relaxed text-navy/80">
              {margin !== null && keepPct !== null
                ? <>
                    The practice keeps {fmtCurrency(margin)} ({fmtNumber(keepPct)}%) of every {fmtCurrency(avg > 0 ? avg : null)} collected per visit, before other overhead, at the current rate.
                  </>
                : rate > 0 && avg > 0 && rate >= avg
                  ? <span className="text-red">The rate per visit equals or exceeds average collections — this role costs more than it brings in.</span>
                  : <span className="text-navy/40">Enter rate and average collections to see margin.</span>
              }
            </p>
          </div>
        )
      })()}

      {structureType === 'revenue_share' && (() => {
        const pct = Number(parameters.sharePct)
        const revenue = Number(parameters.practiceRevenue)
        const collRate = Number(parameters.collectionRate) || 90
        const bonus = pct > 0 && revenue > 0 ? revenue * (pct / 100) : null
        const collected = revenue > 0 ? revenue * (collRate / 100) : null
        const effectivePct = bonus !== null && collected !== null && collected > 0
          ? (bonus / collected) * 100
          : null
        if (bonus === null || collected === null || effectivePct === null) return null
        return (
          <div className="rounded-xl border border-navy/15 bg-light-navy px-4 py-3">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-navy/50">Effective cost on cash collected</p>
            <p className="text-sm leading-relaxed text-navy/80">
              At a {pct}% revenue share on {fmtCurrency(revenue)} in gross revenue, this pays{' '}
              <span className="font-semibold text-navy">{fmtCurrency(bonus)}/month</span>.{' '}
              At your assumed {collRate}% collection rate, the practice collects{' '}
              <span className="font-semibold text-navy">{fmtCurrency(collected)}</span> — so the bonus represents a real share of{' '}
              <span className="font-semibold text-navy">{fmtNumber(effectivePct)}%</span> of cash in the door, not the headline {pct}%.
            </p>
          </div>
        )
      })()}

      {structureType === 'hybrid_two_tier' && (() => {
        const cap = Number(parameters.tier1Cap)
        const t1Pct = Number(parameters.tier1Pct)
        const t2Pct = Number(parameters.tier2Pct)
        if (!cap || !t1Pct || !t2Pct) return null
        const exampleOverage = Math.round((cap * 1.5) / 1000) * 1000
        const t1Amount = cap * (t1Pct / 100)
        const t2Amount = (exampleOverage - cap) * (t2Pct / 100)
        const total = t1Amount + t2Amount
        return (
          <div className="rounded-xl border border-navy/15 bg-light-navy px-4 py-3">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-navy/50">Worked example</p>
            <p className="text-sm leading-relaxed text-navy/80">
              At {fmtCurrency(exampleOverage)} in overage, the practice pays{' '}
              <span className="font-semibold text-navy">{fmtCurrency(total)}</span> in bonus —{' '}
              {fmtCurrency(t1Amount)} on the first {fmtCurrency(cap)}, plus{' '}
              {fmtCurrency(t2Amount)} on the remaining {fmtCurrency(exampleOverage - cap)}.
            </p>
          </div>
        )
      })()}

      {structureType === 'flat_milestone' && parameters.hasStretch === true && (
        <div className="rounded-xl border border-navy/15 bg-light-navy px-4 py-3">
          <p className="text-sm leading-relaxed text-navy/80">
            When the stretch target is reached, the stretch bonus <span className="font-semibold">replaces</span> the first milestone bonus — the two don&apos;t stack. A month that clears both targets pays only the stretch amount.
          </p>
        </div>
      )}

      {structureType === 'collections_only' && (() => {
        const pct = Number(parameters.collectionsPct)
        const target = Number(parameters.targetComp)
        const avg = Number(parameters.avgPerVisit)
        const isWeek = parameters.visitPeriod === 'Week'
        const reqColl = pct > 0 && target > 0 ? target / (pct / 100) : null
        const visitsRaw = reqColl && avg > 0 ? reqColl / avg : null
        const visits = isWeek && visitsRaw ? visitsRaw / 4.33 : visitsRaw
        const period = isWeek ? 'week' : 'month'
        return (
          <div className="rounded-xl border border-navy/15 bg-light-navy px-4 py-3">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-navy/50">What this means</p>
            <p className="text-sm leading-relaxed text-navy/80">
              To take home {fmtCurrency(target > 0 ? target : null)}/month,{' '}
              {fmtCurrency(reqColl)} in collections is needed —{' '}
              about {fmtNumber(visits)} visits a {period} at your current average.
            </p>
          </div>
        )
      })()}

      {structure.guide && (
        <div className="rounded-xl border border-navy/10 bg-light-navy px-4 py-4 space-y-4">
          {structure.guide.map(({ heading, text }) => (
            <div key={heading}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy/50">{heading}</p>
              {Array.isArray(text)
                ? text.map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed text-navy/80 mt-2 first:mt-0">{para}</p>
                  ))
                : <p className="text-sm leading-relaxed text-navy/80">{text}</p>
              }
            </div>
          ))}
        </div>
      )}

      {tierError && (
        <div className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm text-red">
          {tierError}
        </div>
      )}
      {targetWarning && (
        <div className="rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
          {targetWarning}
        </div>
      )}
    </div>
  )
}
