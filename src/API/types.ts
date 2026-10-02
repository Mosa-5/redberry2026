// Transcribed from the API's OpenAPI schemas at
// https://api.kinoxii.redberryinternship.ge/docs

export type Genre = {
  id: number
  slug: string
  name: string
}

export type Format = {
  id: number
  slug: string
  name: string
  /** Added to the film base price. */
  priceUplift: number
}

export type AgeRating = {
  code: "G" | "PG" | "12+" | "16+" | "18+"
  /** Compare against the signed in user's age; below it, disable the session buttons. */
  minAge: number
  /** Tooltip copy for the rating badge. Render as given. */
  description: string
}

export type Movie = {
  id: number
  /** Path key for /movies/{slug}. */
  slug: string
  title: string
  kind: "film" | "event"
  runtimeMinutes: number
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: string
  /** Coming soon titles have no sessions — clicking one must not open seat selection. */
  isComingSoon: boolean
  /** Fills the home page hero. */
  isFeatured: boolean
  /** Cheapest upcoming session, for the "from ₾X" label. */
  fromPrice: number
  ageRating: AgeRating
  genres: Genre[]
  formats: Format[]
  /** Present in live responses but absent from the published schema. */
  isNotified?: boolean
  /** Returned by /movies/featured and /movies/now-playing, not coming-soon. */
  synopsis?: string
}

export type MovieDetail = Movie & {
  synopsis: string
  director: string | null
  cast: string | null
  /** Dates with at least one upcoming session, for the day picker. */
  availableDates: string[]
}
