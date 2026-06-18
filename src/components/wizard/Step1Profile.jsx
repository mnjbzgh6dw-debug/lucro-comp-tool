import { useApp } from '../../AppContext'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-navy/80">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-navy/15 bg-light-gold px-3 py-2 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/40'

export default function Step1Profile() {
  const { profile, updateProfile } = useApp()

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">Who is this for?</h2>
        <p className="mt-1 text-sm text-navy/60">
          A few details to personalise the prep sheet and the conversation.
        </p>
      </div>

      <Field label="Practice Name">
        <input
          className={inputClass}
          value={profile.practiceName}
          onChange={(e) => updateProfile({ practiceName: e.target.value })}
          placeholder="e.g. Summit Family Chiropractic"
        />
      </Field>

      <Field label="Team Member Name">
        <input
          className={inputClass}
          value={profile.teamMemberName}
          onChange={(e) => updateProfile({ teamMemberName: e.target.value })}
          placeholder="e.g. Jordan Lee"
        />
      </Field>

      <Field label="Role / Position">
        <input
          className={inputClass}
          value={profile.role}
          onChange={(e) => updateProfile({ role: e.target.value })}
          placeholder="e.g. Chiropractic Assistant, Associate DC"
        />
      </Field>

      <Field label="Date">
        <input
          type="date"
          className={inputClass}
          value={profile.date}
          onChange={(e) => updateProfile({ date: e.target.value })}
        />
      </Field>
    </div>
  )
}
