import { useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import { cleanMachines, emptyMachineEntry, formatCardio, formatMachine } from '../lib/plan'
import type { CardioPlan, Exercise, MachineEntry, WorkoutExercise } from '../lib/types'
import { fieldClass, toNumber } from './fields'
import MachineRow from './MachineRow'

interface ExerciseCardProps {
  exercise: Exercise
  item: WorkoutExercise
  onSave: (item: WorkoutExercise) => void
  // Only for exercises the user may remove (workouts they created)
  onRemove?: () => void
}

const NOT_SET = 'לא הוגדר עדיין'
// A touch that moves more than this (in px) is a scroll, not a tap
const TAP_SLOP = 10

// Shows the plan for one exercise; tapping the card (or "ערוך") opens an editor for this exercise only
export default function ExerciseCard({ exercise, item, onSave, onRemove }: ExerciseCardProps) {
  const [editing, setEditing] = useState(false)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  function rememberPointerStart(e: PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  // Browsers usually skip the click after a scroll, but some still fire it, so check the distance too
  function openOnTap(e: MouseEvent) {
    const start = pointerStart.current
    pointerStart.current = null
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_SLOP) return
    setEditing(true)
  }

  return (
    <section
      aria-label={exercise.name}
      className={`rounded-xl bg-white p-4 shadow-sm ${editing ? '' : 'cursor-pointer active:bg-slate-50'}`}
      onPointerDown={editing ? undefined : rememberPointerStart}
      onClick={editing ? undefined : openOnTap}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{exercise.name}</h3>
        {!editing && (
          <button
            type="button"
            aria-label={`עריכת ${exercise.name}`}
            className="min-h-12 rounded-lg px-4 font-semibold text-blue-700 hover:bg-blue-50"
            onClick={() => setEditing(true)}
          >
            ערוך
          </button>
        )}
      </div>

      {editing ? (
        <ExerciseEditor
          exercise={exercise}
          item={item}
          onSave={(updated) => {
            onSave(updated)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
          onRemove={onRemove}
        />
      ) : (
        <PlanView exercise={exercise} item={item} />
      )}
    </section>
  )
}

function PlanView({ exercise, item }: { exercise: Exercise; item: WorkoutExercise }) {
  if (exercise.type === 'cardio') {
    return <p className="mt-1 text-lg">{formatCardio(item.cardio) ?? <NotSet />}</p>
  }
  if (item.machines.length === 0) return <NotSet />
  return (
    <ul className="mt-1 flex flex-col gap-1">
      {item.machines.map((entry, index) => (
        <li key={index} className="text-lg">
          {formatMachine(entry)}
        </li>
      ))}
    </ul>
  )
}

function NotSet() {
  return <span className="mt-1 block text-slate-500">{NOT_SET}</span>
}

interface ExerciseEditorProps {
  exercise: Exercise
  item: WorkoutExercise
  onSave: (item: WorkoutExercise) => void
  onCancel: () => void
  onRemove?: () => void
}

function ExerciseEditor({ exercise, item, onSave, onCancel, onRemove }: ExerciseEditorProps) {
  // An exercise with no machines yet opens with one empty row, ready to type into
  const [machines, setMachines] = useState<MachineEntry[]>(() =>
    item.machines.length > 0 ? item.machines.map((entry) => ({ ...entry })) : [emptyMachineEntry()],
  )
  const [cardio, setCardio] = useState<CardioPlan>(() => item.cardio ?? { speedKmh: 0, inclinePct: 0 })

  function save() {
    onSave(exercise.type === 'cardio' ? { ...item, cardio } : { ...item, machines: cleanMachines(machines) })
  }

  function remove() {
    if (onRemove && window.confirm(`להסיר את ${exercise.name} מהאימון?`)) onRemove()
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      {exercise.type === 'cardio' ? (
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="text-sm text-slate-600">מהירות (קמ״ש)</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              className={`${fieldClass} text-center`}
              value={cardio.speedKmh || ''}
              onChange={(e) => setCardio({ ...cardio, speedKmh: toNumber(e.target.value) })}
            />
          </label>
          <label className="flex-1">
            <span className="text-sm text-slate-600">שיפוע (%)</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              className={`${fieldClass} text-center`}
              value={cardio.inclinePct || ''}
              onChange={(e) => setCardio({ ...cardio, inclinePct: toNumber(e.target.value) })}
            />
          </label>
        </div>
      ) : (
        <>
          {machines.length > 0 && (
            <ol className="flex flex-col gap-2">
              {machines.map((entry, index) => (
                <MachineRow
                  key={index}
                  rowNumber={index + 1}
                  entry={entry}
                  onChange={(updated) => setMachines(machines.map((e, i) => (i === index ? updated : e)))}
                  // The last machine stays: clear its fields instead (an empty row is dropped on save)
                  onRemove={
                    machines.length > 1 ? () => setMachines(machines.filter((_, i) => i !== index)) : undefined
                  }
                />
              ))}
            </ol>
          )}
          <button
            type="button"
            className="min-h-12 w-full rounded-lg border-2 border-dashed border-blue-300 font-semibold text-blue-700 hover:bg-blue-50"
            onClick={() => setMachines([...machines, emptyMachineEntry()])}
          >
            + הוספת מכונה
          </button>
        </>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-12 flex-1 rounded-lg bg-blue-600 text-lg font-semibold text-white"
          onClick={save}
        >
          שמור
        </button>
        <button
          type="button"
          className="min-h-12 rounded-lg px-4 font-semibold text-slate-600 hover:bg-slate-200"
          onClick={onCancel}
        >
          ביטול
        </button>
      </div>

      {onRemove && (
        <button
          type="button"
          className="min-h-12 rounded-lg font-semibold text-red-600 hover:bg-red-50"
          onClick={remove}
        >
          הסרה מהאימון
        </button>
      )}
    </div>
  )
}
