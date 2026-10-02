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
