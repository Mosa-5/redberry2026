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

export type Venue = {
  id: number
  /** Value for the `venues[]` sessions filter. */
  slug: string
  name: string
  city: string
  /** Formats this venue can show — narrows the format filter. */
  formats: Format[]
}

export type User = {
  id: number
  username: string
  email: string
  /** Public URL, or null. */
  avatar: string | null
  fullName: string | null
  mobileNumber: string | null
  dateOfBirth: string | null
  /** Derived from dateOfBirth for the age gate; null until the profile is complete. */
  age: number | null
  /** The user payload omits the venue's formats. */
  preferredVenue: Omit<Venue, "formats"> | null
  /** False until fullName, mobileNumber and dateOfBirth are set. Booking is blocked while false. */
  profileComplete: boolean
}

/** What /login and /register return: the user plus a Bearer token. */
export type AuthSession = {
  user: User
  token: string
}

/**
 * Error body. `errors` present means field validation (map onto inputs);
 * absent means a rule or auth failure, and `message` is written for the user.
 */
export type ApiError = {
  message: string
  errors?: Record<string, string[]>
}

/** GET /filter-options — the lists the Sessions filters and profile form choose from. */
export type FilterOptions = {
  venues: Venue[]
  formats: Format[]
  ageRatings: AgeRating[]
}

export type Language = {
  id: number
  slug: string
  name: string
  /** Short label for cards, e.g. "ENG", "GEO". */
  code: string
}

/** One showtime. */
export type Session = {
  id: number
  startsAt: string
  /** "YYYY-MM-DD" */
  date: string
  /** "19:30" */
  time: string
  timeBand: "morning" | "afternoon" | "evening"
  /** Adult price, format uplift included. */
  price: number
  /** Live: drops as others buy or hold seats. */
  seatsLeft: number
  /** Show the card disabled rather than hiding it, so the time stays readable. */
  isSoldOut: boolean
  hall: { id: number; name: string }
  venue: Omit<Venue, "formats">
  format: Format
  language: Language
}

/** /movies/{movie}/sessions groups one date's sessions by venue. */
export type VenueSessions = {
  venue: Omit<Venue, "formats">
  sessions: Session[]
}
