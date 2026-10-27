import { findLastEntry } from '../lib/lastTime'
import type { Exercise, ExerciseLog, MachineEntry } from '../lib/types'
import { emptyMachineEntry } from '../lib/workout'
import MachineRow from './MachineRow'

interface ExerciseCardProps {
  exercise: Exercise
  log: ExerciseLog
  lastEntries: MachineEntry[]
  onChange: (log: ExerciseLog) => void
}

export default function ExerciseCard({ exercise, log, lastEntries, onChange }: ExerciseCardProps) {
  if (exercise.type === 'cardio') {
    return (
      <section aria-label={exercise.name} className="rounded-xl bg-white p-4 shadow-sm">
        <label className="flex min-h-12 items-center gap-3 text-lg font-semibold">
          <input
            type="checkbox"
            className="size-6 accent-blue-600"
            checked={log.done ?? false}
            onChange={(e) => onChange({ ...log, done: e.target.checked })}
          />
          {exercise.name}
        </label>
      </section>
    )
  }

  function updateEntry(index: number, entry: MachineEntry) {
    onChange({ ...log, entries: log.entries.map((e, i) => (i === index ? entry : e)) })
  }

  function removeEntry(index: number) {
    onChange({ ...log, entries: log.entries.filter((_, i) => i !== index) })
  }

  function addEntry() {
    onChange({ ...log, entries: [...log.entries, emptyMachineEntry()] })
  }

  return (
    <section aria-label={exercise.name} className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{exercise.name}</h2>

      {log.entries.length > 0 && (
        <ol className="mt-3 flex flex-col gap-2">
          {log.entries.map((entry, index) => (
            <MachineRow
              key={index}
              rowNumber={index + 1}
              entry={entry}
              lastEntry={findLastEntry(entry.machine, lastEntries)}
              onChange={(updated) => updateEntry(index, updated)}
              onRemove={() => removeEntry(index)}
            />
          ))}
        </ol>
      )}

      <button
        type="button"
        className="mt-3 min-h-12 w-full rounded-lg border-2 border-dashed border-blue-300 font-semibold text-blue-700 hover:bg-blue-50"
        onClick={addEntry}
      >
        + הוספת מכונה
      </button>
    </section>
  )
}
