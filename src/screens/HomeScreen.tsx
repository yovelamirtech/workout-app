import type { WorkoutTemplate } from '../lib/types'

interface HomeScreenProps {
  templates: WorkoutTemplate[]
  onStartWorkout: (templateId: string) => void
}

export default function HomeScreen({ templates, onStartWorkout }: HomeScreenProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">איזה אימון היום?</h2>
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          className="min-h-20 rounded-xl bg-white p-4 text-start shadow-sm hover:bg-blue-50 active:bg-blue-100"
          onClick={() => onStartWorkout(template.id)}
        >
          <span className="block text-lg font-semibold">{template.name}</span>
          <span className="block text-sm text-slate-500">{template.exerciseIds.length} תרגילים</span>
        </button>
      ))}
    </div>
  )
}
