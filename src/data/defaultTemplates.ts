import type { Exercise, WorkoutTemplate } from '../lib/types'

export const defaultExercises: Exercise[] = [
  { id: 'squat-leg-press', name: 'סקוואט / לחיצת רגליים', type: 'weight' },
  { id: 'leg-curl', name: 'כפיפת ברכיים', type: 'weight' },
  { id: 'leg-extension', name: 'פשיטת ברכיים', type: 'weight' },
  { id: 'calf-raise', name: 'תאומים', type: 'weight' },
  { id: 'cable-biceps-curl', name: 'כפיפת מרפקים בכבל', type: 'weight' },
  { id: 'cable-triceps-extension', name: 'פשיטת מרפקים בכבל', type: 'weight' },
  { id: 'bench-press', name: 'לחיצת חזה', type: 'weight' },
  { id: 'lat-pulldown', name: 'פולי עליון', type: 'weight' },
  { id: 'machine-fly', name: 'פרפר במכונה', type: 'weight' },
  { id: 'machine-row', name: 'חתירה במכונה', type: 'weight' },
  { id: 'cable-lateral-raise', name: 'הרחקת כתפיים בכבל', type: 'weight' },
  { id: 'incline-walk', name: 'הליכה בשיפוע', type: 'cardio' },
]

export const defaultTemplates: WorkoutTemplate[] = [
  {
    id: 'legs-arms',
    name: 'רגליים + ידיים',
    exerciseIds: [
      'squat-leg-press',
      'leg-curl',
      'leg-extension',
      'calf-raise',
      'cable-biceps-curl',
      'cable-triceps-extension',
    ],
  },
  {
    id: 'chest-back-shoulders-cardio',
    name: 'חזה, גב, כתפיים + קרדיו',
    exerciseIds: [
      'bench-press',
      'lat-pulldown',
      'machine-fly',
      'machine-row',
      'cable-lateral-raise',
      'incline-walk',
    ],
  },
]
