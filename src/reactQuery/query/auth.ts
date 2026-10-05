import { skipToken, useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { me } from "@/API/requests/Auth"
import type { User } from "@/API/types"
import { useToken } from "@/hooks/use-token"
import type { HookOptions } from "@/reactQuery/types"

/**
 * The signed-in user, or undefined for a guest. Also restores the session
 * after a reload, which is what the API docs ask /me to be called for.
 *
 * The token is part of the key, so when it disappears — logout, the 401
 * interceptor, another tab — the cached user stops being read at once.
 */
export const useGetMe = <T = User>(
  { queryOptions }: HookOptions<User, T> = {}
): UseQueryResult<T, AxiosError> => {
  const token = useToken()

  return useQuery<User, AxiosError, T>({
    queryKey: ["me", token],
    queryFn: token ? me : skipToken,
    ...queryOptions,
  })
}
