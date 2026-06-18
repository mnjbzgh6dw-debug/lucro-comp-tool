import ParametersPanel from './ParametersPanel'
import ScenarioTable from './ScenarioTable'
import ScenarioSlider from './ScenarioSlider'
import VerdictPanel from './VerdictPanel'
import TalkingPoints from './TalkingPoints'
import CompChart from './CompChart'
import { useComputedScenarios } from '../../utils/useComputedScenarios'

export default function Dashboard() {
  const { structure } = useComputedScenarios()
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left: parameters */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ParametersPanel />
        </div>

        {/* Right: scenarios + output */}
        <div className="space-y-6">
          <ScenarioTable />

          <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-display text-base font-bold text-navy">
              Comp vs {structure.metric.label} by Scenario
            </h2>
            <CompChart />
          </div>

          <ScenarioSlider />
          <VerdictPanel />
          <TalkingPoints />
        </div>
      </div>
    </div>
  )
}
