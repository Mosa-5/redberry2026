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

/** Today and the following days, as "YYYY-MM-DD" — the brief's 7-day pickers. */
export const nextDays = (count: number) =>
  Array.from({ length: count }, (_, offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return toIsoDate(date)
  })

/**
 * "YYYY-MM-DD" → "Tue 15 Sep", the booking summaries' format. Built from
 * en-US parts: en-GB's short month is "Sept", Figma has "Sep".
 */
export const shortDay = (value: string) => {
  const parts = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short" }).formatToParts(
    fromIsoDate(value)
  )
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value
  return `${part("weekday")} ${part("day")} ${part("month")}`
}
