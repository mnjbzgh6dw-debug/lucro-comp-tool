import { useApp } from '../../AppContext'
import Step1Profile from './Step1Profile'
import Step2StructureSelector from './Step2StructureSelector'
import Step3Parameters from './Step3Parameters'
import { validateStructure } from '../../utils/calculations'

const STEPS = ['Profile', 'Structure', 'Parameters']

function Progress({ step }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1
        const active = n === step
        const done = n < step
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition ${
                  active
                    ? 'bg-gold text-navy'
                    : done
                      ? 'bg-navy text-white'
                      : 'bg-navy/10 text-navy/50'
                }`}
              >
                {done ? '✓' : n}
              </span>
              <span
                className={`text-sm font-medium ${
                  active ? 'text-navy' : 'text-navy/40'
                }`}
              >
                {label}
              </span>
            </div>
            {n < STEPS.length && <span className="mx-3 h-px w-8 bg-navy/20" />}
          </div>
        )
      })}
    </div>
  )
}

export default function Wizard() {
  const { wizardStep, setWizardStep, setPhase, structureType, parameters } = useApp()
  const tierError = validateStructure(structureType, parameters)

  const next = () => {
    if (wizardStep < 3) setWizardStep(wizardStep + 1)
    else if (!tierError) setPhase('dashboard')
  }
  const back = () => setWizardStep(Math.max(1, wizardStep - 1))

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Progress step={wizardStep} />

      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        {wizardStep === 1 && <Step1Profile />}
        {wizardStep === 2 && <Step2StructureSelector />}
        {wizardStep === 3 && <Step3Parameters />}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back}
            disabled={wizardStep === 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-navy/60 transition hover:text-navy disabled:invisible"
          >
            ← Back
          </button>

          <button
            onClick={next}
            disabled={wizardStep === 3 && !!tierError}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {wizardStep < 3 ? 'Continue →' : 'Build My Scenarios →'}
          </button>
        </div>
      </div>
    </div>
  )
}
