import { useApp } from '../../AppContext'
import { STRUCTURE_LIST } from '../../constants/structures'

export default function Step2StructureSelector() {
  const { structureType, chooseStructure } = useApp()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">
          Choose a compensation structure
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          Pick the model you want to bring to the table. You can change this later.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STRUCTURE_LIST.map((s) => {
          const selected = s.id === structureType
          return (
            <button
              key={s.id}
              onClick={() => chooseStructure(s.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                selected
                  ? 'border-gold bg-light-gold shadow-sm'
                  : 'border-navy/10 bg-white hover:border-gold/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-navy">{s.name}</h3>
                {selected && (
                  <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
                    ✓
                  </span>
                )}
              </div>
              <p
                className={`mt-1 text-sm leading-snug ${
                  selected ? 'text-navy/80' : 'text-navy/55'
                }`}
              >
                {s.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
