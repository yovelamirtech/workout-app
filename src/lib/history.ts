import type { MachineEntry, WeightUnit, WorkoutSession, WorkoutTemplate } from './types'

export function sortSessionsNewestFirst(sessions: WorkoutSession[]): WorkoutSession[] {
  // Reverse first so that, on the same date, the later-saved session comes first
  return [...sessions].reverse().sort((a, b) => b.date.localeCompare(a.date))
}

export function getTemplateName(templateId: string, templates: WorkoutTemplate[]): string {
  return templates.find((t) => t.id === templateId)?.name ?? 'אימון'
}

// Local date as YYYY-MM-DD (not UTC, so a late-night workout keeps today's date)
export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// "2026-10-23" -> "23/10/2026"
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

const UNIT_LABELS: Record<WeightUnit, string> = { kg: 'ק״ג', lb: 'פאונד', other: '' }

// "40 ק״ג", "90 פאונד", or just "7" for a machine-specific number
export function formatWeight(weight: number, unit: WeightUnit): string {
  return `${weight} ${UNIT_LABELS[unit]}`.trim()
}

// "כבל 40 ק״ג · מכונה 90 פאונד"
export function formatEntries(entries: MachineEntry[]): string {
  return entries
    .map((entry) => {
      const weight = formatWeight(entry.weight, entry.unit)
      return entry.machine ? `${entry.machine} ${weight}` : weight
    })
    .join(' · ')
}
