import type { SessionDetail } from "@/API/types"
import { shortDay } from "@/lib/dates"

/**
 * "PREMIERE · WEEK OF 15 SEPT" for the hero banner. Derived from the release
 * date because the API has no such field.
 */
export const premiereLabel = (releaseDate: string) => {
  const date = new Date(releaseDate)
  const day = date.getDate()
  const month = date.toLocaleString("en-GB", { month: "short" }).toUpperCase()
  return `PREMIERE · WEEK OF ${day} ${month}`
}

/** "IN CINEMAS 2 OCTOBER" for the Coming Soon card. */
export const releaseLabel = (releaseDate: string) => {
  const date = new Date(releaseDate)
  const day = date.getDate()
  const month = date.toLocaleString("en-GB", { month: "long" }).toUpperCase()
  return `IN CINEMAS ${day} ${month}`
}

/** 16 → "16", 13.2 → "13.20". Child and student prices are fractions of the adult one. */
export const formatPrice = (amount: number) => (Number.isInteger(amount) ? String(amount) : amount.toFixed(2))

/** ["Adult", "Child", "Adult"] → "2 x Adult, 1 x Child", in the order types first appear. */
export const ticketsLine = (types: string[]) => {
  const counts = new Map<string, number>()
  types.forEach((type) => counts.set(type, (counts.get(type) ?? 0) + 1))
  return [...counts].map(([type, count]) => `${count} x ${type}`).join(", ")
}

/** "Hall B · Tue 15 Sep · 16:30", with the venue first when asked (the confirmation has it). */
export const sessionShortLine = (session: SessionDetail, withVenue = false) =>
  [withVenue && session.venue.name, `Hall ${session.hall.name}`, shortDay(session.date), session.time]
    .filter(Boolean)
    .join(" · ")
