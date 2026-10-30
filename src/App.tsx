import { useState } from 'react'
import { defaultExercises, defaultTemplates } from './data/defaultTemplates'
import { toIsoDate } from './lib/history'
import { loadSessions, saveSessions } from './lib/storage'
import type { ExerciseLog, WorkoutSession } from './lib/types'
import HistoryScreen from './screens/HistoryScreen'
import HomeScreen from './screens/HomeScreen'
import WorkoutScreen from './screens/WorkoutScreen'

type Screen =
  | { name: 'home' }
  | { name: 'workout'; templateId: string }
  | { name: 'edit'; sessionId: string }
  | { name: 'history' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [sessions, setSessions] = useState<WorkoutSession[]>(loadSessions)

  const activeTemplate =
    screen.name === 'workout' ? defaultTemplates.find((t) => t.id === screen.templateId) : undefined

  const editedSession = screen.name === 'edit' ? sessions.find((s) => s.id === screen.sessionId) : undefined
  const editedTemplate = editedSession && defaultTemplates.find((t) => t.id === editedSession.templateId)

  function finishWorkout(templateId: string, logs: ExerciseLog[]) {
    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      date: toIsoDate(new Date()),
      templateId,
      logs,
    }
    const updatedSessions = [...sessions, newSession]
    setSessions(updatedSessions)
    saveSessions(updatedSessions)
    setScreen({ name: 'history' })
  }

  function saveEditedSession(sessionId: string, logs: ExerciseLog[]) {
    const updatedSessions = sessions.map((session) => (session.id === sessionId ? { ...session, logs } : session))
    setSessions(updatedSessions)
    saveSessions(updatedSessions)
    setScreen({ name: 'history' })
  }

  function deleteSession(sessionId: string) {
    const updatedSessions = sessions.filter((session) => session.id !== sessionId)
    setSessions(updatedSessions)
    saveSessions(updatedSessions)
  }

  const navButtonClass = (active: boolean) =>
    `min-h-12 flex-1 rounded-lg font-semibold ${active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-6">
      <header className="flex flex-col gap-3 py-4">
        <h1 className="text-2xl font-bold">יומן אימונים</h1>
        {(screen.name === 'home' || screen.name === 'history') && (
          <nav className="flex gap-2">
            <button
              type="button"
              className={navButtonClass(screen.name === 'home')}
              onClick={() => setScreen({ name: 'home' })}
            >
              אימון חדש
            </button>
            <button
              type="button"
              className={navButtonClass(screen.name === 'history')}
              onClick={() => setScreen({ name: 'history' })}
            >
              היסטוריה
            </button>
          </nav>
        )}
      </header>

      <main>
        {screen.name === 'home' && (
          <HomeScreen
            templates={defaultTemplates}
            onStartWorkout={(templateId) => setScreen({ name: 'workout', templateId })}
          />
        )}
        {activeTemplate && (
          <WorkoutScreen
            template={activeTemplate}
            exercises={defaultExercises}
            sessions={sessions}
            onFinish={(logs) => finishWorkout(activeTemplate.id, logs)}
            onCancel={() => setScreen({ name: 'home' })}
          />
        )}
        {editedSession && editedTemplate && (
          <WorkoutScreen
            template={editedTemplate}
            exercises={defaultExercises}
            // "Last time" hints come from the other workouts, not the one being edited
            sessions={sessions.filter((s) => s.id !== editedSession.id)}
            initialLogs={editedSession.logs}
            onFinish={(logs) => saveEditedSession(editedSession.id, logs)}
            onCancel={() => setScreen({ name: 'history' })}
          />
        )}
        {screen.name === 'history' && (
          <HistoryScreen
            sessions={sessions}
            templates={defaultTemplates}
            exercises={defaultExercises}
            onEdit={(sessionId) => setScreen({ name: 'edit', sessionId })}
            onDelete={deleteSession}
          />
        )}
      </main>
    </div>
  )
}
