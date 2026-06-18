import { useApp } from '../../AppContext'
import { STRUCTURES } from '../../constants/structures'
import { validateStructure } from '../../utils/calculations'
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {structure.fields.map((field) => (
          <div
            key={field.key}
            className={field.type === 'tiers' ? 'sm:col-span-2' : ''}
          >
            <FieldRenderer field={field} params={parameters} updateParam={updateParam} />
          </div>
        ))}
      </div>

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
