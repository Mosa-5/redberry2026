import { httpClient } from "../index"
import type { AuthSession, User } from "../types"

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  username: string
  email: string
  password: string
  passwordConfirmation: string
  avatar?: File
}

/** A 401 here means wrong credentials, not an expired session. */
export const login = async (input: LoginInput): Promise<AuthSession> => {
  const response = await httpClient.post<{ data: AuthSession }>("/login", input)
  return response.data.data
}

/**
 * Creates the account and signs in — the response already carries a token.
 * Multipart because of the optional avatar.
 */
export const register = async ({ passwordConfirmation, avatar, ...fields }: RegisterInput): Promise<AuthSession> => {
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => form.append(key, value))
  // The one snake_case field in the API.
  form.append("password_confirmation", passwordConfirmation)
  if (avatar) form.append("avatar", avatar)

  const response = await httpClient.post<{ data: AuthSession }>("/register", form)
  return response.data.data
}

/** Revokes only the current token. Clear it locally whatever the response. */
export const logout = async (): Promise<void> => {
  await httpClient.post("/logout")
}

/** The signed-in user. Call on boot when a token is stored; 401 means it's stale. */
export const me = async (): Promise<User> => {
  const response = await httpClient.get<{ data: User }>("/me")
  return response.data.data
}

export type ProfileInput = {
  fullName: string
  /** Spaces are fine — the API strips them before validating. */
  mobileNumber: string
  /** YYYY-MM-DD */
  dateOfBirth: string
  preferredVenueId?: number
}

/**
 * Saves the profile and returns the updated user. Multipart, as the API
 * expects (it also takes an avatar). There is no way to clear a preferred
 * venue once set — the API ignores both an empty value and null.
 */
export const updateProfile = async ({ preferredVenueId, ...fields }: ProfileInput): Promise<User> => {
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => form.append(key, value))
  if (preferredVenueId !== undefined) form.append("preferredVenueId", String(preferredVenueId))

  const response = await httpClient.put<{ data: User }>("/profile", form)
  return response.data.data
}
