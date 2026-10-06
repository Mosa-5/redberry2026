import { httpClient } from "../index";
import type { Movie, MovieDetail, VenueSessions } from "../types";

/** Header typeahead. Returns at most 6 matches; a blank query returns []. */
export const searchMovies = async (name:string):Promise<Movie[]>  => {
    try{
    const movies = await httpClient.get<{ data: Movie[] }>("/search", {
    params: { q: name },
  })

   return movies.data.data;
    } catch (error) {
        console.error("Error searching for movies:", error);
        throw error;
    }
}


export const featuredMovies = async ():Promise<Movie[]>  => {
    try{
    const movies = await httpClient.get<{ data: Movie[] }>("/movies/featured")
  
   return movies.data.data;
    } catch (error) {
        console.error("Error fetching featured movies:", error);
        throw error;
    }
}


/** One film with everything the details page shows. Keyed by slug. */
/** Films currently on release. `limit` caps the list for the home row. */
export const nowPlayingMovies = async (limit?: number): Promise<Movie[]> => {
  try {
    const movies = await httpClient.get<{ data: Movie[] }>("/movies/now-playing", {
      params: { limit },
    })
    return movies.data.data
  } catch (error) {
    console.error("Error fetching now playing movies:", error)
    throw error
  }
}

/** Unreleased films. These have no sessions — offer Notify Me, not tickets. */
export const comingSoonMovies = async (limit?: number): Promise<Movie[]> => {
  try {
    const movies = await httpClient.get<{ data: Movie[] }>("/movies/coming-soon", {
      params: { limit },
    })
    return movies.data.data
  } catch (error) {
    console.error("Error fetching coming soon movies:", error)
    throw error
  }
}

export const movieDetail = async (slug: string): Promise<MovieDetail> => {
  try {
    const movie = await httpClient.get<{ data: MovieDetail }>(`/movies/${slug}`)
    return movie.data.data
  } catch (error) {
    console.error("Error fetching movie detail:", error)
    throw error
  }
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
