import { useNavigate, useSearchParams } from "react-router"

import type { SessionFilters } from "@/API/requests/Sessions"
import type { SessionSort, TimeBand } from "@/API/types"
import { toIsoDate } from "@/lib/dates"

const SORTS: SessionSort[] = ["time_asc", "time_desc", "price_asc", "price_desc", "title_asc"]
const BANDS: TimeBand[] = ["morning", "afternoon", "evening"]
const DEFAULT_SORT: SessionSort = "time_asc"

// URL keys, in the brief's own shape: /sessions?venue=galleria,batumi&date=…&format=max&sort=price_asc&page=2
const KEYS = { venues: "venue", formats: "format", languages: "language", bands: "time" } as const

type ListKey = keyof typeof KEYS

const list = (params: URLSearchParams, key: string) => params.get(key)?.split(",").filter(Boolean) ?? []

/** Reads the URL into filters, falling back to defaults for anything missing or invalid. */
const parse = (params: URLSearchParams): SessionFilters => {
  const date = params.get("date")
  const sort = params.get("sort") as SessionSort | null
  const page = Number(params.get("page"))

  return {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : toIsoDate(new Date()),
    venues: list(params, KEYS.venues),
    formats: list(params, KEYS.formats),
    languages: list(params, KEYS.languages),
    bands: list(params, KEYS.bands).filter((band): band is TimeBand => BANDS.includes(band as TimeBand)),
    sort: sort && SORTS.includes(sort) ? sort : DEFAULT_SORT,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

/** Writes filters back, leaving defaults out so shared links stay short. */
const serialize = (filters: SessionFilters) => {
  const params = new URLSearchParams()
  if (filters.date !== toIsoDate(new Date())) params.set("date", filters.date)
  ;(Object.keys(KEYS) as ListKey[]).forEach((key) => {
    if (filters[key].length) params.set(KEYS[key], filters[key].join(","))
  })
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort)
  if (filters.page > 1) params.set("page", String(filters.page))
  return params
}

/**
 * The Sessions page state, kept in the URL as the brief requires: a copied
 * link restores the same view, refresh keeps it, and every change is a new
 * history entry so Back steps through previous filter states.
 */
export const useSessionFilters = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const filters = parse(params)

  /**
   * Any change other than the page itself returns to page 1 — the brief's
   * rule, so adding a filter on page 4 never lands on an empty page 4.
   */
  const update = (changes: Partial<SessionFilters>) => {
    const next = { ...filters, ...changes }
    if (!("page" in changes)) next.page = 1
    // Commas are valid in a query string; keeping them unencoded makes the
    // link read like the brief's example instead of venue=galleria%2Cbatumi.
    const search = serialize(next).toString().replaceAll("%2C", ",")
    navigate({ search: search ? `?${search}` : "" })
  }

  const activeCount = filters.venues.length + filters.formats.length + filters.languages.length + filters.bands.length

  return { filters, update, activeCount }
}
