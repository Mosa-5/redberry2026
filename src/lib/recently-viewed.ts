import { useMemo, useSyncExternalStore } from "react"

import type { Movie } from "@/api/types"

// The API has no history endpoint, so views are kept in the browser. Whole
// Movie objects are stored because there is no batch lookup by slug; storing
// slugs would mean one request per card. Not auth-gated, so one list per
// browser serves guests and signed-in users alike.
const KEY = "recently-viewed"
const LIMIT = 4

const listeners = new Set<() => void>()

const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** Puts a film at the front of the list, dropping any earlier entry for it. */
export const recordView = (movie: Movie) => {
  const current = parse(read()).filter((entry) => entry.id !== movie.id)
  try {
    localStorage.setItem(KEY, JSON.stringify([movie, ...current].slice(0, LIMIT)))
  } catch {
    return
  }
  listeners.forEach((notify) => notify())
}

const parse = (raw: string | null): Movie[] => {
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  // Keeps other open tabs in sync.
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Most recent first. The raw string is the snapshot so it stays referentially stable. */
export const useRecentlyViewed = () => {
  const raw = useSyncExternalStore(subscribe, read)
  return useMemo(() => parse(raw), [raw])
}
