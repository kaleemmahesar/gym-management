export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function parseISODate(iso: string): Date {
  // Treat YYYY-MM-DD as local date to avoid timezone drift in UI comparisons
  const [y, m, d] = iso.split('-').map((x) => Number(x))
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function daysBetween(aISO: string, bISO: string): number {
  const a = parseISODate(aISO)
  const b = parseISODate(bISO)
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function isSameMonth(iso: string, year: number, monthIndex0: number): boolean {
  const d = parseISODate(iso)
  return d.getFullYear() === year && d.getMonth() === monthIndex0
}

export function calcAge(dobISO: string, refISO = todayISO()): number {
  const dob = parseISODate(dobISO)
  const ref = parseISODate(refISO)
  let age = ref.getFullYear() - dob.getFullYear()
  const m = ref.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age -= 1
  return Math.max(0, age)
}

