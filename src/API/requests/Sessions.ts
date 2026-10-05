import { httpClient } from "../index"
import type { FilterOptions } from "../types"

/** Venues, formats, age ratings and the other lists filters choose from. */
export const filterOptions = async (): Promise<FilterOptions> => {
  const response = await httpClient.get<{ data: FilterOptions }>("/filter-options")
  return response.data.data
}
