import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RcTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useComputedScenarios } from '../../utils/useComputedScenarios'
import { fmtCurrency } from '../../utils/format'

const NAVY = '#1B2A4A'
const GOLD = '#C9A84C'

export default function CompChart({ height = 280, width = null, forPrint = false }) {
  const { rows, structure } = useComputedScenarios()

  const metricIsCurrency = structure.metric.format !== 'number'
  const data = rows
    .filter((r) => r.metricNumber !== null && r.result?.totalComp != null)
    .map((r) => ({
      label: r.label || '—',
      metric: r.metricNumber,
      comp: r.result.totalComp,
    }))

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-navy/40">
        Add scenario values to see the chart.
      </div>
    )
  }

  const chartInner = (
    <BarChart
      data={data}
      width={width || undefined}
      height={width ? height : undefined}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fontSize: forPrint ? 9 : 11, fill: NAVY }}
        interval={0}
      />
      <YAxis
        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        tick={{ fontSize: forPrint ? 9 : 11, fill: NAVY }}
        width={48}
      />
      {!forPrint && (
        <RcTooltip
          formatter={(v, name) => [
            fmtCurrency(v),
            name === 'metric' ? structure.metric.label : 'Total Comp',
          ]}
        />
      )}
      <Legend wrapperStyle={{ fontSize: forPrint ? 9 : 12 }} />
      <Bar dataKey="metric" name={structure.metric.label} fill={NAVY} radius={[3, 3, 0, 0]} />
      <Bar dataKey="comp" name="Total Comp" fill={GOLD} radius={[3, 3, 0, 0]} />
    </BarChart>
  )

  // Fixed-width mode (print) skips ResponsiveContainer, which measures 0 in a
  // hidden/cloned container.
  if (width) return chartInner

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartInner}
    </ResponsiveContainer>
  )
}
