import { formatDate, formatEntries, getTemplateName, sortSessionsNewestFirst } from '../lib/history'
import type { Exercise, WorkoutSession, WorkoutTemplate } from '../lib/types'

interface HistoryScreenProps {
  sessions: WorkoutSession[]
  templates: WorkoutTemplate[]
  exercises: Exercise[]
}

export default function HistoryScreen({ sessions, templates, exercises }: HistoryScreenProps) {
  if (sessions.length === 0) {
    return <p className="py-8 text-center text-slate-500">עדיין אין אימונים שמורים</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">היסטוריה</h2>
      <ul className="flex flex-col gap-3">
        {sortSessionsNewestFirst(sessions).map((session) => (
          <li key={session.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{getTemplateName(session.templateId, templates)}</h3>
              <time dateTime={session.date} className="text-sm text-slate-500">
                {formatDate(session.date)}
              </time>
            </div>
            <ul className="mt-2 text-sm text-slate-600">
              {session.logs.map((log) => {
                const exercise = exercises.find((e) => e.id === log.exerciseId)
                return (
                  <li key={log.exerciseId}>
                    {exercise?.name ?? log.exerciseId}:{' '}
                    {exercise?.type === 'cardio' ? '✓' : formatEntries(log.entries)}
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
