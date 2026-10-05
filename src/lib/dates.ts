// Dates as the API sends them: "YYYY-MM-DD", no time, no timezone. Parsed
// and printed in local time so a date never shifts by a day across zones.

/** Local date → "YYYY-MM-DD". ISO dates compare correctly as strings. */
export const toIsoDate = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, "0")).join("-")

/** "YYYY-MM-DD" → local Date at midnight (not UTC, unlike new Date(string)). */
export const fromIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Today minus `years`, as a local Date. */
export const yearsAgo = (years: number) => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  date.setHours(0, 0, 0, 0)
  return date
}
