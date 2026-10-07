import { createContext, useContext } from "react"

import type { Movie, Session } from "@/API/types"

export type BookingContextValue = {
  /**
   * What a session click does, from any page: log in first if needed, send
   * an incomplete profile to /profile, otherwise open the booking modal.
   * The film comes along because a session from the lists doesn't carry it.
   */
  openBooking: (session: Session, movie: Movie) => void
}

export const BookingContext = createContext<BookingContextValue | null>(null)

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) throw new Error("useBooking must be used inside BookingProvider")
  return context
}
