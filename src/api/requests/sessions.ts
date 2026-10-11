import { httpClient } from "../index"
import type { FilterOptions, SessionSort, SessionsPage, TimeBand } from "../types"

/** Venues, formats, age ratings and the other lists filters choose from. */
export const filterOptions = async (): Promise<FilterOptions> => {
  const response = await httpClient.get<{ data: FilterOptions }>("/filter-options")
  return response.data.data
}

export type SessionFilters = {
  /** "YYYY-MM-DD" */
  date: string
  venues: string[]
  formats: string[]
  languages: string[]
  bands: TimeBand[]
  sort: SessionSort
  page: number
}

/**
 * Every showing on one date matching the filters, grouped by film. Array
 * filters take slugs (OR within a filter, AND across filters).
 */
export const sessions = async (filters: SessionFilters): Promise<SessionsPage> => {
  // axios writes arrays as venues[]=a&venues[]=b by default, which the API
  // reads as a list (venues[0]=a works too). Without the brackets it would
  // reject them as "must be an array". Empty arrays are left out.
  const response = await httpClient.get<SessionsPage>("/sessions", { params: filters })
  return response.data
}
