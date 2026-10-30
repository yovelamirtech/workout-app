import { useState } from 'react'
import { fieldClass } from '../components/fields'
import type { Workout } from '../lib/types'

interface HomeScreenProps {
  workouts: Workout[]
  onOpenWorkout: (workoutId: string) => void
  onCreateWorkout: (name: string) => void
}

export default function HomeScreen({ workouts, onOpenWorkout, onCreateWorkout }: HomeScreenProps) {
  const [newName, setNewName] = useState<string | null>(null) // non-null while the form is open

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">איזה אימון היום?</h2>
      {workouts.map((workout) => (
        <button
          key={workout.id}
          type="button"
          className="min-h-20 rounded-xl bg-white p-4 text-start shadow-sm hover:bg-blue-50 active:bg-blue-100"
          onClick={() => onOpenWorkout(workout.id)}
        >
          <span className="block text-lg font-semibold">{workout.name}</span>
          <span className="block text-sm text-slate-500">{workout.exercises.length} תרגילים</span>
        </button>
      ))}

      {newName === null ? (
        <button
          type="button"
          className="min-h-12 rounded-lg border-2 border-dashed border-blue-300 font-semibold text-blue-700 hover:bg-blue-50"
          onClick={() => setNewName('')}
        >
          + אימון חדש
        </button>
      ) : (
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm">
          <label>
            <span className="sr-only">שם האימון החדש</span>
            <input
              type="text"
              placeholder="שם האימון"
              className={fieldClass}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-12 flex-1 rounded-lg bg-blue-600 font-semibold text-white disabled:bg-slate-300"
              disabled={newName.trim() === ''}
              onClick={() => onCreateWorkout(newName)}
            >
              יצירה
            </button>
            <button
              type="button"
              className="min-h-12 rounded-lg px-4 font-semibold text-slate-600 hover:bg-slate-200"
              onClick={() => setNewName(null)}
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
