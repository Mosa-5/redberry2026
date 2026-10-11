import { httpClient } from "../index"
import type { Order, SeatHold, SeatMap, SessionDetail, TicketTypeSlug } from "../types"

/** One session with its film, for the booking modal header. */
export const session = async (id: number): Promise<SessionDetail> => {
  const response = await httpClient.get<{ data: SessionDetail }>(`/sessions/${id}`)
  return response.data.data
}

/**
 * The hall as built in the database. Public; with a token, seats the user
 * is holding right now (an unexpired 8-minute hold, not a purchase) come
 * back with `isMine`, so their selection can be restored.
 */
export const seatMap = async (sessionId: number): Promise<SeatMap> => {
  const response = await httpClient.get<{ data: SeatMap }>(`/sessions/${sessionId}/seats`)
  return response.data.data
}

export type HoldInput = {
  sessionId: number
  seats: { seatId: number; ticketType: TicketTypeSlug }[]
}

/** Holds up to 3 seats for 8 minutes. Holding again replaces the previous hold. */
export const holdSeats = async ({ sessionId, seats }: HoldInput): Promise<SeatHold> => {
  const response = await httpClient.post<{ data: SeatHold }>(`/sessions/${sessionId}/holds`, { seats })
  return response.data.data
}

/** Reads a hold back after a reload. An expired hold is 200 with isLive false; 404 means it never existed. */
export const hold = async (holdId: string): Promise<SeatHold> => {
  const response = await httpClient.get<{ data: SeatHold }>(`/holds/${holdId}`)
  return response.data.data
}

/** Frees the seats at once. Not for going back from checkout to the map. */
export const releaseHold = async (holdId: string): Promise<void> => {
  await httpClient.delete(`/holds/${holdId}`, { reauth: false })
}

export type OrderInput = {
  holdId: string
  fullName: string
  email: string
  mobileNumber: string
  /** Spaces are stripped by the API. */
  cardNumber: string
  /** "MM/YY" */
  expiry: string
  cvv: string
}

/** Turns a live hold into a paid order. The only call that sells seats. */
export const createOrder = async (input: OrderInput): Promise<Order> => {
  const response = await httpClient.post<{ data: Order }>("/orders", input)
  return response.data.data
}
