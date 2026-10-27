import { formatWeight } from '../lib/history'
import type { MachineEntry, WeightUnit } from '../lib/types'

interface MachineRowProps {
  rowNumber: number
  entry: MachineEntry
  lastEntry: MachineEntry | null
  onChange: (entry: MachineEntry) => void
  onRemove: () => void
}

const UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: 'ק״ג' },
  { value: 'lb', label: 'פאונד' },
  { value: 'other', label: 'אחר' },
]

function toNumber(value: string): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

const fieldClass =
  'w-full min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-lg focus:border-blue-500 focus:outline-none'

export default function MachineRow({ rowNumber, entry, lastEntry, onChange, onRemove }: MachineRowProps) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-slate-200 p-2">
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">שם מכונה {rowNumber}</span>
          <input
            type="text"
            placeholder="שם המכונה (למשל: כבל)"
            className={fieldClass}
            value={entry.machine}
            onChange={(e) => onChange({ ...entry, machine: e.target.value })}
          />
        </label>
        <button
          type="button"
          aria-label={`מחיקת מכונה ${rowNumber}`}
          className="min-h-12 min-w-12 rounded-lg text-2xl text-red-600 hover:bg-red-50"
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">משקל מכונה {rowNumber}</span>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            placeholder="משקל"
            className={`${fieldClass} text-center`}
            value={entry.weight || ''}
            onChange={(e) => onChange({ ...entry, weight: toNumber(e.target.value) })}
          />
        </label>
        <label>
          <span className="sr-only">יחידה מכונה {rowNumber}</span>
          <select
            className={fieldClass}
            value={entry.unit}
            onChange={(e) => onChange({ ...entry, unit: e.target.value as WeightUnit })}
          >
            {UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {lastEntry && (
        <p className="text-sm text-slate-600">
          פעם קודמת: <span className="font-semibold">{formatWeight(lastEntry.weight, lastEntry.unit)}</span>
        </p>
      )}
    </li>
  )
}
