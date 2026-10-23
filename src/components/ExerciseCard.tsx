import { formatSets } from '../lib/history'
import type { Exercise, ExerciseLog, SetEntry, Suggestion } from '../lib/types'
import { getNewSetDefaults } from '../lib/workout'
import SetRow from './SetRow'

interface ExerciseCardProps {
  exercise: Exercise
  log: ExerciseLog
  lastLog: ExerciseLog | null
  suggestion: Suggestion | null
  onChange: (log: ExerciseLog) => void
}

function formatSuggestion(suggestion: Suggestion, exercise: Exercise): string {
  if (exercise.type === 'bodyweight') return `${suggestion.reps} חזרות`
  return `${suggestion.weightKg} ק״ג × ${suggestion.reps}`
}

export default function ExerciseCard({ exercise, log, lastLog, suggestion, onChange }: ExerciseCardProps) {
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

  function updateSet(index: number, set: SetEntry) {
    onChange({ ...log, sets: log.sets.map((s, i) => (i === index ? set : s)) })
  }

  function removeSet(index: number) {
    onChange({ ...log, sets: log.sets.filter((_, i) => i !== index) })
  }

  function addSet() {
    onChange({ ...log, sets: [...log.sets, getNewSetDefaults(log.sets, suggestion, exercise)] })
  }

  return (
    <section aria-label={exercise.name} className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{exercise.name}</h2>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-sm text-slate-600">
        <dt>פעם קודמת:</dt>
        <dd>{lastLog ? formatSets(lastLog.sets, exercise.type) : 'אין עדיין'}</dd>
        <dt>מוצע היום:</dt>
        <dd className="font-semibold text-blue-700">
          {suggestion ? formatSuggestion(suggestion, exercise) : '—'}
        </dd>
      </dl>

      {log.sets.length > 0 && (
        <ol className="mt-3 flex flex-col gap-2">
          {log.sets.map((set, index) => (
            <SetRow
              key={index}
              setNumber={index + 1}
              set={set}
              showWeight={exercise.type === 'weight'}
              onChange={(updated) => updateSet(index, updated)}
              onRemove={() => removeSet(index)}
            />
          ))}
        </ol>
      )}

      <button
        type="button"
        className="mt-3 min-h-12 w-full rounded-lg border-2 border-dashed border-blue-300 font-semibold text-blue-700 hover:bg-blue-50"
        onClick={addSet}
      >
        + הוספת סט
      </button>
    </section>
  )
}
