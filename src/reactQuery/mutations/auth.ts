import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import {
  login,
  logout,
  register,
  updateProfile,
  type LoginInput,
  type ProfileInput,
  type RegisterInput,
} from "@/api/requests/auth"
import { setToken } from "@/api/token"
import type { ApiError, AuthSession, User } from "@/api/types"

/**
 * Shared by login and register. The user goes into the cache before the
 * token is set: setting the token re-renders useGetMe under the new key,
 * and the data must already be there or it would fetch /me for nothing.
 */
const startSession = (queryClient: QueryClient, { user, token }: AuthSession) => {
  queryClient.setQueryData(["me", token], user)
  setToken(token)
  // Notify Me state and tickets are per user.
  queryClient.invalidateQueries({ queryKey: ["comingSoonMovies"] })
  queryClient.invalidateQueries({ queryKey: ["movie"] })
  // Removed, not invalidated: a 401 or another tab's logout leaves the
  // previous user's tickets cached, and stale data would still show while
  // the refetch runs.
  queryClient.removeQueries({ queryKey: ["tickets"] })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation<AuthSession, AxiosError<ApiError>, LoginInput>({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (session) => startSession(queryClient, session),
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  return useMutation<AuthSession, AxiosError<ApiError>, RegisterInput>({
    mutationKey: ["register"],
    mutationFn: register,
    onSuccess: (session) => startSession(queryClient, session),
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  return useMutation<void, AxiosError<ApiError>>({
    mutationKey: ["logout"],
    mutationFn: logout,
    // The API docs: clear the token whatever the response, so a failed
    // request can never leave the user stuck signed in.
    onSettled: () => {
      setToken(null)
      // Not clear(): that empties the cache without refetching, so sections
      // on screen would keep the previous user's data. Reset clears every
      // query and refetches the ones on screen.
      queryClient.resetQueries()
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation<User, AxiosError<ApiError>, ProfileInput>({
    mutationKey: ["updateProfile"],
    mutationFn: updateProfile,
    // The response is the saved user, so write it straight into ["me", token]
    // (prefix match) — the navbar dot and banner update without a refetch.
    onSuccess: (user) => queryClient.setQueriesData({ queryKey: ["me"] }, user),
  })
}
