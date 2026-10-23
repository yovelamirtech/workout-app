import { useState } from 'react'
import ExerciseCard from '../components/ExerciseCard'
import { getLastLog, suggestNext } from '../lib/progression'
import type { Exercise, ExerciseLog, WorkoutSession, WorkoutTemplate } from '../lib/types'
import { finalizeLogs } from '../lib/workout'

interface WorkoutScreenProps {
  template: WorkoutTemplate
  exercises: Exercise[]
  sessions: WorkoutSession[]
  onFinish: (logs: ExerciseLog[]) => void
  onCancel: () => void
}

export default function WorkoutScreen({ template, exercises, sessions, onFinish, onCancel }: WorkoutScreenProps) {
  const templateExercises = template.exerciseIds
    .map((id) => exercises.find((exercise) => exercise.id === id))
    .filter((exercise) => exercise !== undefined)

  const [draftLogs, setDraftLogs] = useState<ExerciseLog[]>(() =>
    templateExercises.map((exercise) => ({ exerciseId: exercise.id, sets: [] })),
  )

  const finishedLogs = finalizeLogs(draftLogs)

  function updateLog(updated: ExerciseLog) {
    setDraftLogs((logs) => logs.map((log) => (log.exerciseId === updated.exerciseId ? updated : log)))
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">{template.name}</h2>

      {templateExercises.map((exercise, index) => {
        const lastLog = getLastLog(exercise.id, sessions)
        return (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            log={draftLogs[index]}
            lastLog={lastLog}
            suggestion={suggestNext(lastLog, exercise)}
            onChange={updateLog}
          />
        )
      })}

      <div className="sticky bottom-0 -mx-4 flex gap-2 bg-slate-100/95 px-4 py-3">
        <button
          type="button"
          className="min-h-12 flex-1 rounded-lg bg-blue-600 text-lg font-semibold text-white disabled:bg-slate-300"
          disabled={finishedLogs.length === 0}
          onClick={() => onFinish(finishedLogs)}
        >
          סיום ושמירה
        </button>
        <button
          type="button"
          className="min-h-12 rounded-lg px-4 font-semibold text-slate-600 hover:bg-slate-200"
          onClick={onCancel}
        >
          ביטול
        </button>
      </div>
    </div>
  )
}
