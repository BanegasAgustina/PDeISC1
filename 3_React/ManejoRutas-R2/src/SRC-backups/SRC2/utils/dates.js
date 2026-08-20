const toDate = (value) => new Date(`${value}T12:00:00`)

export const formatTaskDate = (value) => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(toDate(value)).replace('.', '').toUpperCase()
export const formatLongDate = (value) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(toDate(value))

export function groupLabel(value) {
  const target = toDate(value); const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (target.getTime() === today.getTime()) return 'Hoy'
  if (target.getTime() === tomorrow.getTime()) return 'Mañana'
  if (target.getTime() === yesterday.getTime()) return 'Ayer'
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' }).format(target)
}
