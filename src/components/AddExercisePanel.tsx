import { useState } from 'react'
import type { Exercise, ExerciseType } from '../lib/types'
import { fieldClass } from './fields'

interface AddExercisePanelProps {
  // Exercises not in the workout yet
  available: Exercise[]
  onAdd: (exerciseId: string) => void
  onCreate: (name: string, type: ExerciseType) => void
  onClose: () => void
}

// Stays open after adding, so several exercises can be added in a row
export default function AddExercisePanel({ available, onAdd, onCreate, onClose }: AddExercisePanelProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ExerciseType>('weight')

  function create() {
    onCreate(name, type)
    setName('')
  }

  return (
    <section aria-label="הוספת תרגיל" className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">הוספת תרגיל</h3>

      {available.length > 0 && (
        <ul className="flex flex-col gap-2">
          {available.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                className="min-h-12 w-full rounded-lg border border-slate-200 px-3 text-start hover:bg-blue-50"
                onClick={() => onAdd(exercise.id)}
              >
                + {exercise.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-200 pt-3">
        <span className="font-semibold">תרגיל חדש</span>
        <label>
          <span className="sr-only">שם התרגיל החדש</span>
          <input
            type="text"
            placeholder="שם התרגיל"
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">סוג התרגיל החדש</span>
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value as ExerciseType)}>
            <option value="weight">משקולות</option>
            <option value="cardio">קרדיו</option>
          </select>
        </label>
        <button
          type="button"
          className="min-h-12 rounded-lg bg-blue-600 font-semibold text-white disabled:bg-slate-300"
          disabled={name.trim() === ''}
          onClick={create}
        >
          יצירה והוספה
        </button>
      </div>

      <button
        type="button"
        className="min-h-12 rounded-lg font-semibold text-slate-600 hover:bg-slate-200"
        onClick={onClose}
      >
        סגירה
      </button>
    </section>
  )
}
