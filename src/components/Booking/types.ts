import type { TicketTypeSlug } from "@/API/types"

/** One seat the user picked, in the order they picked it. */
export type SelectedSeat = {
  seatId: number
  code: string
  ticketType: TicketTypeSlug
}
