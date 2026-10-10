import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { refundOrder } from "@/API/requests/Tickets"
import type { ApiError, Order } from "@/API/types"

export const useRefundOrder = () => {
  const queryClient = useQueryClient()
  return useMutation<Order, AxiosError<ApiError>, string>({
    mutationKey: ["refundOrder"],
    mutationFn: refundOrder,
    onSuccess: (refunded) => {
      // The API docs: re-render the card from the returned order rather than
      // removing it locally. It is now refunded, so it moves to Past.
      queryClient.setQueryData<Order[]>(["tickets"], (orders) =>
        orders?.map((order) => (order.id === refunded.id ? refunded : order))
      )
      // The seats are back on sale: maps and seats-left counts changed.
      queryClient.invalidateQueries({ queryKey: ["seatMap"] })
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      queryClient.invalidateQueries({ queryKey: ["movieSessions"] })
    },
  })
}
