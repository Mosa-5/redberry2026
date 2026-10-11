// The Bearer token from /login or /register. Memory is the source of truth;
// localStorage only carries it across reloads, since the API has no cookie
// session to fall back on. Subscribable, so React can react when the 401
// interceptor drops it.

const KEY = "kino-token"

const listeners = new Set<() => void>()

const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

let current = read()

export const getToken = () => current

/** Pass null to sign out locally. */
export const setToken = (token: string | null) => {
  current = token
  try {
    if (token) localStorage.setItem(KEY, token)
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked or full: the session still works from memory, it
    // just won't survive a reload.
  }
  listeners.forEach((notify) => notify())
}

/** For useSyncExternalStore. Also follows sign-ins and sign-outs in other tabs. */
export const subscribeToken = (onChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return
    current = event.newValue
    onChange()
  }
  listeners.add(onChange)
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}
