import { useState } from 'react'
import AddExercisePanel from '../components/AddExercisePanel'
import ExerciseCard from '../components/ExerciseCard'
import { fieldClass } from '../components/fields'
import { addExerciseToWorkout, removeExerciseFromWorkout, updateWorkoutExercise } from '../lib/plan'
import type { Exercise, ExerciseType, Workout } from '../lib/types'

interface WorkoutScreenProps {
  workout: Workout
  exercises: Exercise[] // every known exercise, default and custom
  onUpdate: (workout: Workout) => void
  onCreateExercise: (name: string, type: ExerciseType) => void
  onDelete: () => void
  onBack: () => void
}

export default function WorkoutScreen({
  workout,
  exercises,
  onUpdate,
  onCreateExercise,
  onDelete,
  onBack,
}: WorkoutScreenProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState<string | null>(null) // non-null while renaming

  const items = workout.exercises.flatMap((item) => {
    const exercise = exercises.find((e) => e.id === item.exerciseId)
    return exercise ? [{ item, exercise }] : []
  })
  const available = exercises.filter((exercise) => !workout.exercises.some((item) => item.exerciseId === exercise.id))

  function saveName() {
    if (newName === null || newName.trim() === '') return
    onUpdate({ ...workout, name: newName.trim() })
    setNewName(null)
  }

  function confirmDelete() {
    if (window.confirm(`למחוק את האימון "${workout.name}"?`)) onDelete()
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="min-h-12 self-start rounded-lg px-2 font-semibold text-blue-700 hover:bg-blue-50"
        onClick={onBack}
      >
        → האימונים שלי
      </button>

      {newName === null ? (
        <h2 className="text-xl font-bold">{workout.name}</h2>
      ) : (
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">שם האימון</span>
            <input type="text" className={fieldClass} value={newName} onChange={(e) => setNewName(e.target.value)} />
          </label>
          <button
            type="button"
            className="min-h-12 rounded-lg bg-blue-600 px-4 font-semibold text-white disabled:bg-slate-300"
            disabled={newName.trim() === ''}
            onClick={saveName}
          >
            שמור
          </button>
          <button
            type="button"
            className="min-h-12 rounded-lg px-3 font-semibold text-slate-600 hover:bg-slate-200"
            onClick={() => setNewName(null)}
          >
            ביטול
          </button>
        </div>
      )}

      {items.length === 0 && <p className="text-slate-500">אין עדיין תרגילים באימון</p>}

      {items.map(({ item, exercise }) => (
        <ExerciseCard
          key={item.exerciseId}
          exercise={exercise}
          item={item}
          onSave={(updated) => onUpdate(updateWorkoutExercise(workout, updated))}
          onRemove={workout.builtIn ? undefined : () => onUpdate(removeExerciseFromWorkout(workout, item.exerciseId))}
        />
      ))}

      {!workout.builtIn &&
        (adding ? (
          <AddExercisePanel
            available={available}
            onAdd={(exerciseId) => onUpdate(addExerciseToWorkout(workout, exerciseId))}
            onCreate={onCreateExercise}
            onClose={() => setAdding(false)}
          />
        ) : (
          <>
            <button
              type="button"
              className="min-h-12 w-full rounded-lg border-2 border-dashed border-blue-300 font-semibold text-blue-700 hover:bg-blue-50"
              onClick={() => setAdding(true)}
            >
              + הוספת תרגיל
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="min-h-12 flex-1 rounded-lg font-semibold text-slate-600 hover:bg-slate-200"
                onClick={() => setNewName(workout.name)}
              >
                שינוי שם
              </button>
              <button
                type="button"
                className="min-h-12 flex-1 rounded-lg font-semibold text-red-600 hover:bg-red-50"
                onClick={confirmDelete}
              >
                מחיקת אימון
              </button>
            </div>
          </>
        ))}
    </div>
  )
}
