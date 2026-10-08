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
