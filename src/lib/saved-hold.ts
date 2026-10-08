// The live seat hold. Memory is the source of truth, so releasing it on
// close works even when storage is blocked or full; localStorage only
// carries it across reloads so the user gets their seats back instead of
// finding them blocked (the team's advice: store the hold id and prove
// ownership with the map's isMine). One entry: the API allows one hold per
// user per session, and the modal shows one session at a time.

const KEY = "kino-hold"

type SavedHold = { holdId: string; sessionId: number }

const read = (): SavedHold | null => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

let current = read()

export const saveHold = (hold: SavedHold) => {
  current = hold
  try {
    localStorage.setItem(KEY, JSON.stringify(hold))
  } catch {
    // Storage blocked or full: the hold still works and is still released
    // on close, it just won't survive a reload.
  }
}

/** The saved hold, whatever its session: for reopening the modal after a reload. */
export const getSavedHold = () => current

/** The saved hold id for this session, or null. GET /holds/{id} says whether it's still live. */
export const readSavedHold = (sessionId: number): string | null =>
  current?.sessionId === sessionId ? current.holdId : null

export const clearSavedHold = () => {
  current = null
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing stored if storage is blocked.
  }
}
