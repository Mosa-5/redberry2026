import { skipToken, useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { hold, seatMap, session } from "@/api/requests/booking"
import type { SeatHold, SeatMap, SessionDetail } from "@/api/types"
import type { HookOptions } from "@/reactQuery/types"

/** The booking modal header. Seeded from the clicked card, so it shows at once. */
export const useGetSessionDetail = <T = SessionDetail>(
  { queryOptions }: HookOptions<SessionDetail, T> = {},
  sessionId?: number
): UseQueryResult<T, AxiosError> => {
  return useQuery<SessionDetail, AxiosError, T>({
    queryKey: ["sessionDetail", sessionId],
    queryFn: sessionId ? () => session(sessionId) : skipToken,
    ...queryOptions,
  })
}

/**
 * The hall map. Seat states change while others buy, so it is always stale:
 * the API asks for a fresh map every time the modal opens on step 1.
 */
export const useGetSeatMap = <T = SeatMap>(
  { queryOptions }: HookOptions<SeatMap, T> = {},
  sessionId?: number
): UseQueryResult<T, AxiosError> => {
  return useQuery<SeatMap, AxiosError, T>({
    queryKey: ["seatMap", sessionId],
    queryFn: sessionId ? () => seatMap(sessionId) : skipToken,
    staleTime: 0,
    ...queryOptions,
  })
}

/**
 * A saved hold read back after a reload, to restore it. Never served from
 * cache: a hold replaced or released since would still look live there.
 */
export const useGetHold = <T = SeatHold>(
  { queryOptions }: HookOptions<SeatHold, T> = {},
  holdId?: string
): UseQueryResult<T, AxiosError> => {
  return useQuery<SeatHold, AxiosError, T>({
    queryKey: ["hold", holdId],
    queryFn: holdId ? () => hold(holdId) : skipToken,
    staleTime: 0,
    gcTime: 0,
    ...queryOptions,
  })
}
