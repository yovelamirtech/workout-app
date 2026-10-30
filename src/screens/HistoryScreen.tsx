import { formatDate, formatEntries, getTemplateName, sortSessionsNewestFirst } from '../lib/history'
import type { Exercise, WorkoutSession, WorkoutTemplate } from '../lib/types'

interface HistoryScreenProps {
  sessions: WorkoutSession[]
  templates: WorkoutTemplate[]
  exercises: Exercise[]
  onDelete: (sessionId: string) => void
}

export default function HistoryScreen({ sessions, templates, exercises, onDelete }: HistoryScreenProps) {
  if (sessions.length === 0) {
    return <p className="py-8 text-center text-slate-500">עדיין אין אימונים שמורים</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">היסטוריה</h2>
      <ul className="flex flex-col gap-3">
        {sortSessionsNewestFirst(sessions).map((session) => {
          const templateName = getTemplateName(session.templateId, templates)
          const date = formatDate(session.date)

          function confirmDelete() {
            if (window.confirm(`למחוק את האימון "${templateName}" מתאריך ${date}?`)) onDelete(session.id)
          }

          return (
            <li key={session.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{templateName}</h3>
                <div className="flex items-center gap-1">
                  <time dateTime={session.date} className="text-sm text-slate-500">
                    {date}
                  </time>
                  <button
                    type="button"
                    aria-label={`מחיקת אימון ${templateName} ${date}`}
                    className="min-h-12 min-w-12 rounded-lg text-2xl text-red-600 hover:bg-red-50"
                    onClick={confirmDelete}
                  >
                    ×
                  </button>
                </div>
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
          )
        })}
      </ul>
    </div>
  )
}
