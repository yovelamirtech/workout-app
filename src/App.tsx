import { useEffect, useState } from 'react'
import { defaultExercises } from './data/defaultWorkouts'
import { addExerciseToWorkout, createExercise, createWorkout } from './lib/plan'
import { loadData, saveData, type AppData } from './lib/storage'
import type { ExerciseType, Workout } from './lib/types'
import HomeScreen from './screens/HomeScreen'
import WorkoutScreen from './screens/WorkoutScreen'

type Screen = { name: 'home' } | { name: 'workout'; workoutId: string }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [data, setData] = useState<AppData>(loadData)

  // Every change is saved right away: there is no "finish" step
  useEffect(() => saveData(data), [data])

  const exercises = [...defaultExercises, ...data.customExercises]
  const activeWorkout = screen.name === 'workout' ? data.workouts.find((w) => w.id === screen.workoutId) : undefined

  function updateWorkout(updated: Workout) {
    setData((d) => ({ ...d, workouts: d.workouts.map((w) => (w.id === updated.id ? updated : w)) }))
  }

  function addWorkout(name: string) {
    const workout = createWorkout(name)
    setData((d) => ({ ...d, workouts: [...d.workouts, workout] }))
    setScreen({ name: 'workout', workoutId: workout.id })
  }

  function deleteWorkout(workoutId: string) {
    setData((d) => ({ ...d, workouts: d.workouts.filter((w) => w.id !== workoutId) }))
    setScreen({ name: 'home' })
  }

  function addNewExercise(workoutId: string, name: string, type: ExerciseType) {
    const exercise = createExercise(name, type)
    setData((d) => ({
      customExercises: [...d.customExercises, exercise],
      workouts: d.workouts.map((w) => (w.id === workoutId ? addExerciseToWorkout(w, exercise.id) : w)),
    }))
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-6">
      <header className="py-4">
        <h1 className="text-2xl font-bold">תוכנית אימונים</h1>
      </header>

      <main>
        {screen.name === 'home' && (
          <HomeScreen
            workouts={data.workouts}
            onOpenWorkout={(workoutId) => setScreen({ name: 'workout', workoutId })}
            onCreateWorkout={addWorkout}
          />
        )}
        {activeWorkout && (
          <WorkoutScreen
            key={activeWorkout.id}
            workout={activeWorkout}
            exercises={exercises}
            onUpdate={updateWorkout}
            onCreateExercise={(name, type) => addNewExercise(activeWorkout.id, name, type)}
            onDelete={() => deleteWorkout(activeWorkout.id)}
            onBack={() => setScreen({ name: 'home' })}
          />
        )}
      </main>
    </div>
  )
}
