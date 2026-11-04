export function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatTimeInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function localDate(dateString: string): Date {
  if (!dateString) return new Date()
  const parts = dateString.split('-').map(Number)
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date()
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 12)
}

export function monthLabel(dateString: string): string {
  try {
    return localDate(dateString).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function shortDateLabel(dateString: string): string {
  try {
    return localDate(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function fullDateLabel(dateString: string): string {
  try {
    return localDate(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function timeLabel(time: string, format24h: boolean = false): string {
  if (!time) return ''
  const [hStr, mStr] = time.split(':')
  const hours = Number(hStr)
  const minutes = Number(mStr)
  if (isNaN(hours) || isNaN(minutes)) return time
  if (format24h) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
  const date = new Date(1970, 0, 1, hours, minutes)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function greeting(date: Date): string {
  const hours = date.getHours()
  if (hours < 12) return 'Good morning'
  if (hours < 18) return 'Good afternoon'
  return 'Good evening'
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = localDate(value)
  const [year, month, day] = value.split('-').map(Number)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function isValidTimeString(value: unknown): value is string {
  return (
    value === '' ||
    (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value))
  )
}
