import { httpClient } from "../index"
import type { Order } from "../types"

/**
 * Every order of the signed-in user, newest session first. Each carries its
 * full session and tickets, so a card needs no further requests. Without a
 * filter it returns both tabs; `isUpcoming` tells them apart.
 */
export const tickets = async (): Promise<Order[]> => {
  const response = await httpClient.get<{ data: Order[] }>("/tickets")
  return response.data.data
}

/**
 * Refunds a whole order by its reference ("KX-7QF2LD"): the seats go back on
 * sale and the order moves to Past. Returns the updated order. A 422 means
 * it was refused (already refunded, or inside the 2-hour cutoff); its
 * message says which.
 */
export const refundOrder = async (reference: string): Promise<Order> => {
  const response = await httpClient.post<{ data: Order }>(`/orders/${reference}/refund`)
  return response.data.data
}
