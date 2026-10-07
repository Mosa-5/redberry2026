import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { createOrder, holdSeats, releaseHold, type HoldInput, type OrderInput } from "@/API/requests/Booking"
import type { ApiError, Order, SeatHold } from "@/API/types"

/** A 409 from holds or orders names the seats that were lost. */
export type SeatConflict = ApiError & { contested?: string[] }

export const useHoldSeats = () => {
  return useMutation<SeatHold, AxiosError<SeatConflict>, HoldInput>({
    mutationKey: ["holdSeats"],
    mutationFn: holdSeats,
  })
}

export const useReleaseHold = () => {
  const queryClient = useQueryClient()
  return useMutation<void, AxiosError<ApiError>, string>({
    mutationKey: ["releaseHold"],
    mutationFn: releaseHold,
    // The seats are free again; whatever map is cached now shows them taken.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["seatMap"] }),
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation<Order, AxiosError<SeatConflict>, OrderInput>({
    mutationKey: ["createOrder"],
    mutationFn: createOrder,
    // Seats were sold: the map, the seats-left counts and My Tickets all changed.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatMap"] })
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      queryClient.invalidateQueries({ queryKey: ["movieSessions"] })
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
    },
  })
}
