import { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react'
import { STRUCTURES } from './constants/structures'
import { getMonthlyGoal } from './utils/calculations'

const AppContext = createContext(null)

const TODAY = '2026-06-18'

function freshScenarios(structureType, parameters) {
  const goal = getMonthlyGoal(structureType, parameters)
  return [
    { id: crypto.randomUUID(), label: 'Below Goal', goalMultiplier: 0.75, metricValue: goal != null ? Math.round(goal * 0.75) : '', locked: true },
    { id: crypto.randomUUID(), label: 'At Goal',    goalMultiplier: 1.0,  metricValue: goal ?? '', locked: true },
    { id: crypto.randomUUID(), label: 'Above Goal', goalMultiplier: 1.5,  metricValue: goal != null ? Math.round(goal * 1.5) : '', locked: true },
  ]
}

export function AppProvider({ children }) {
  const [phase, setPhase] = useState('wizard')
  const [wizardStep, setWizardStep] = useState(1)
  const [profile, setProfile] = useState({
    practiceName: '',
    teamMemberName: '',
    role: '',
    date: TODAY,
  })
  const [structureType, setStructureType] = useState('base_collections')
  const structureTypeRef = useRef('base_collections')
  const [parameters, setParameters] = useState({ ...STRUCTURES.base_collections.defaults })
  const [scenarios, setScenarios] = useState(() =>
    freshScenarios('base_collections', STRUCTURES.base_collections.defaults)
  )
  const [sliderValue, setSliderValue] = useState(null)
  const [expectedValue, setExpectedValue] = useState('')

  const updateProfile = useCallback((patch) => {
    setProfile((p) => ({ ...p, ...patch }))
  }, [])

  // Switching structure resets parameters + scenarios to that structure's defaults.
  // Reselecting the current structure is a no-op (keeps the user's scenarios).
  const chooseStructure = useCallback((type) => {
    if (type === structureTypeRef.current) return
    structureTypeRef.current = type
    const defaults = { ...STRUCTURES[type].defaults }
    setStructureType(type)
    setParameters(defaults)
    setScenarios(freshScenarios(type, defaults))
    setSliderValue(null)
    setExpectedValue('')
  }, [])

  const updateParam = useCallback((key, value) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateParams = useCallback((patch) => {
    setParameters((prev) => ({ ...prev, ...patch }))
  }, [])

  const addScenario = useCallback(() => {
    setScenarios((prev) => {
      if (prev.length >= 8) return prev
      return [
        ...prev,
        { id: crypto.randomUUID(), label: '', metricValue: '', locked: false },
      ]
    })
  }, [])

  const updateScenario = useCallback((id, patch) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const removeScenario = useCallback((id) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id || s.locked))
  }, [])

  // Keep the locked "At Goal" row's metric synced to the current goal value.
  const goal = getMonthlyGoal(structureType, parameters)
  const syncedScenarios = useMemo(
    () =>
      scenarios.map((s) => {
        if (!s.locked) return s
        if (s.goalMultiplier != null && goal != null) {
          return { ...s, metricValue: Math.round(goal * s.goalMultiplier) }
        }
        return { ...s, metricValue: goal ?? '' }
      }),
    [scenarios, goal]
  )

  const goToStep = useCallback((step) => {
    setWizardStep(step)
    setPhase('wizard')
  }, [])

  const value = {
    phase,
    setPhase,
    wizardStep,
    setWizardStep,
    goToStep,
    profile,
    updateProfile,
    structureType,
    chooseStructure,
    parameters,
    updateParam,
    updateParams,
    scenarios: syncedScenarios,
    addScenario,
    updateScenario,
    removeScenario,
    sliderValue,
    setSliderValue,
    expectedValue,
    setExpectedValue,
    goal,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
