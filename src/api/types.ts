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

export type TimeBand = "morning" | "afternoon" | "evening"

/** GET /filter-options — the lists the Sessions filters and profile form choose from. */
export type FilterOptions = {
  venues: Venue[]
  formats: Format[]
  languages: Language[]
  /** label like "Morning (before 12:00)". */
  timeBands: { id: TimeBand; label: string }[]
  sorts: { id: SessionSort; label: string }[]
  ageRatings: AgeRating[]
  /** Booking: price ratios and the child block. Read from here, never hardcode. */
  ticketTypes: TicketType[]
  maxSeatsPerOrder: number
  holdMinutes: number
}

export type TicketTypeSlug = "adult" | "child" | "student"

export type TicketType = {
  id: number
  slug: TicketTypeSlug
  name: string
  /** Multiplied by the session price. */
  priceRatio: number
  note: string | null
  /** Refused when the film's minAge is at or above this (child: 16). */
  blockedFromRatingAge: number | null
}

export type SessionSort = "time_asc" | "time_desc" | "price_asc" | "price_desc" | "title_asc"

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
  timeBand: TimeBand
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

/** GET /sessions/{id} adds the film; the booking modal header is built from it. */
export type SessionDetail = Session & { movie: Movie }

/** `held` is someone else's live hold; `unavailable` is a gap with no seat. */
export type SeatState = "available" | "sold" | "held" | "unavailable"

export type Seat = {
  /** Send as `seatId` when holding. */
  id: number
  /** "E7" — for summaries, the order and the ticket. */
  code: string
  /** "7" — inside the seat button. */
  label: string
  state: SeatState
  /** A gangway runs to the right of this seat. Visual only. */
  aisleAfter: boolean
  /** Part of the signed-in user's own live hold. */
  isMine: boolean
}

/** GET /sessions/{id}/seats. Sections hold rows, rows hold seats; never flatten. */
export type SeatMap = {
  sessionId: number
  hall: { id: number; name: string; venue: Omit<Venue, "formats"> }
  sections: {
    name: string
    rows: { label: string; seats: Seat[] }[]
  }[]
}

export type SeatHold = {
  holdId: string
  sessionId: number
  /** Tick the countdown against this, not secondsRemaining. */
  expiresAt: string
  secondsRemaining: number
  /** False once expired; GET /holds/{id} still answers 200 then. */
  isLive: boolean
  subtotal: number
  seats: {
    seatId: number
    code: string
    ticketType: { slug: TicketTypeSlug; name: string }
    price: number
  }[]
}

export type Order = {
  id: number
  /** "KX-7QF2LD" — shown on the confirmation. */
  reference: string
  status: "paid" | "refunded"
  totalPrice: number
  paidAt: string
  refundedAt: string | null
  /** Paid and not started: the Upcoming tab. */
  isUpcoming: boolean
  /** Drives the Refund button; the 2-hour cutoff is already applied. */
  isRefundable: boolean
  cardLastFour: string
  contact: { fullName: string; email: string; mobileNumber: string }
  session: SessionDetail
  tickets: {
    id: number
    seatCode: string
    ticketType: { slug: TicketTypeSlug; name: string }
    price: number
  }[]
}

/** /movies/{movie}/sessions groups one date's sessions by venue. */
export type VenueSessions = {
  venue: Omit<Venue, "formats">
  sessions: Session[]
}

/** One film's showtimes on the Sessions page. */
export type MovieSessions = {
  movie: Movie
  sessions: Session[]
}

/** GET /sessions. Pagination counts films, not sessions — 10 films a page. */
export type SessionsPage = {
  data: MovieSessions[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    /** For "Showing X sessions". */
    totalSessions: number
    totalMovies: number
    date: string
  }
}
