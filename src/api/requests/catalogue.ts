import { httpClient } from "../index"
import type { Movie, MovieDetail, VenueSessions } from "../types"

/** Header typeahead. Returns at most 6 matches; a blank query returns []. */
export const searchMovies = async (name: string): Promise<Movie[]> => {
  const response = await httpClient.get<{ data: Movie[] }>("/search", {
    params: { q: name },
  })
  return response.data.data
}

/** The home hero's featured films. */
export const featuredMovies = async (): Promise<Movie[]> => {
  const response = await httpClient.get<{ data: Movie[] }>("/movies/featured")
  return response.data.data
}

/** Films currently on release. `limit` caps the list for the home row. */
export const nowPlayingMovies = async (limit?: number): Promise<Movie[]> => {
  const response = await httpClient.get<{ data: Movie[] }>("/movies/now-playing", {
    params: { limit },
  })
  return response.data.data
}

/** Unreleased films. These have no sessions — offer Notify Me, not tickets. */
export const comingSoonMovies = async (limit?: number): Promise<Movie[]> => {
  const response = await httpClient.get<{ data: Movie[] }>("/movies/coming-soon", {
    params: { limit },
  })
  return response.data.data
}

/** One film with everything the details page shows. Keyed by slug. */
export const movieDetail = async (slug: string): Promise<MovieDetail> => {
  const response = await httpClient.get<{ data: MovieDetail }>(`/movies/${slug}`)
  return response.data.data
}

/**
 * One date's sessions for a film, grouped by venue. Coming soon titles
 * return an empty array on every date.
 */
export const movieSessions = async (slug: string, date: string): Promise<VenueSessions[]> => {
  const response = await httpClient.get<{ data: VenueSessions[] }>(`/movies/${slug}/sessions`, {
    params: { date },
  })
  return response.data.data
}

/**
 * Subscribes the signed-in user to a coming soon title. Repeat calls are a
 * no-op that still succeed, and there is no unsubscribe.
 */
export const notifyMovie = async (slug: string): Promise<void> => {
  await httpClient.post(`/movies/${slug}/notify`)
}
