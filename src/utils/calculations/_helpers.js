// Shared numeric guards for the calculation engine.
// Every formula routes through these so outputs are never NaN or Infinity.

/** Coerce to a finite number, or null if empty / non-numeric. */
export function num(v) {
  if (v === '' || v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

/** Like num(), but treats 0 (and negatives) as "missing" for required inputs. */
export function reqNum(v) {
  const n = num(v)
  if (n === null || n <= 0) return null
  return n
}

/** Safe division — returns null if denominator is missing or zero. */
export function safeDiv(a, b) {
  if (a === null || b === null || b === 0) return null
  return a / b
}

/** Convert a base salary + salaryType toggle into a monthly figure. */
export function monthlyBaseFrom(baseSalary, salaryType) {
  const base = reqNum(baseSalary)
  if (base === null) return null
  return salaryType === 'Annual' ? base / 12 : base
}

/** Empty / undefined result shape used when inputs are insufficient. */
export const EMPTY_RESULT = {
  bonus: null,
  totalComp: null,
  annualComp: null,
  costPct: null,
  belowGoal: false,
  note: null,
  monthlyBase: null,
  extra: {},
}
