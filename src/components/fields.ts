// Shared by the edit forms

export function toNumber(value: string): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

export const fieldClass =
  'w-full min-h-12 rounded-lg border border-slate-300 bg-white px-3 text-lg focus:border-blue-500 focus:outline-none'
