import type { SetEntry } from '../lib/types'

interface SetRowProps {
  setNumber: number
  set: SetEntry
  showWeight: boolean
  onChange: (set: SetEntry) => void
  onRemove: () => void
}

function toNumber(value: string): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

const inputClass =
  'w-full min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-center text-lg focus:border-blue-500 focus:outline-none'

export default function SetRow({ setNumber, set, showWeight, onChange, onRemove }: SetRowProps) {
  return (
    <li className="flex items-center gap-2">
      <span className="w-6 shrink-0 text-center font-semibold text-slate-500">{setNumber}</span>
      {showWeight && (
        <label className="flex-1">
          <span className="sr-only">משקל סט {setNumber}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            placeholder="ק״ג"
            className={inputClass}
            value={set.weightKg || ''}
            onChange={(e) => onChange({ ...set, weightKg: toNumber(e.target.value) })}
          />
        </label>
      )}
      <label className="flex-1">
        <span className="sr-only">חזרות סט {setNumber}</span>
        <input
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          placeholder="חזרות"
          className={inputClass}
          value={set.reps || ''}
          onChange={(e) => onChange({ ...set, reps: Math.round(toNumber(e.target.value)) })}
        />
      </label>
      <button
        type="button"
        aria-label={`מחיקת סט ${setNumber}`}
        className="min-h-12 min-w-12 rounded-lg text-2xl text-red-600 hover:bg-red-50"
        onClick={onRemove}
      >
        ×
      </button>
    </li>
  )
}
