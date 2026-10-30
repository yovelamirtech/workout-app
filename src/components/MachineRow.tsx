import type { MachineEntry, WeightUnit } from '../lib/types'
import { fieldClass, toNumber } from './fields'

interface MachineRowProps {
  rowNumber: number
  entry: MachineEntry
  onChange: (entry: MachineEntry) => void
  onRemove?: () => void // omitted when this row can't be removed
}

const UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'kg', label: 'ק״ג' },
  { value: 'lb', label: 'פאונד' },
  { value: 'other', label: 'אחר' },
]

export default function MachineRow({ rowNumber, entry, onChange, onRemove }: MachineRowProps) {
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
          className="min-h-12 min-w-12 rounded-lg text-2xl text-red-600 hover:bg-red-50 disabled:text-slate-300 disabled:hover:bg-transparent"
          disabled={!onRemove}
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
    </li>
  )
}
