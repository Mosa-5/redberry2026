import { useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { me } from "@/API/requests/Auth"
import { hold } from "@/API/requests/Booking"
import { getToken } from "@/API/token"
import type { Movie, Session, SessionDetail } from "@/API/types"
import { useAuthDialog } from "@/components/Auth/auth-dialog-context"
import { BookingContext } from "@/components/Booking/booking-context"
import { BookingDialog } from "@/components/Booking/booking-dialog"
import { clearSavedHold, getSavedHold, readSavedHold } from "@/lib/saved-hold"
import { useReleaseHold } from "@/reactQuery/mutations/booking"

/** Owns the booking modal so the film page and the Sessions page open the same one. */
export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const { requireAuth } = useAuthDialog()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutate: releaseHold } = useReleaseHold()

  // A reload mid-checkout picks up where the user was (the API docs' reason
  // for GET /holds/{id}): reopen the modal if the saved hold is still live.
  // The modal then restores the seats, types and countdown from it.
  useEffect(() => {
    const saved = getSavedHold()
    if (!saved || !getToken()) return
    hold(saved.holdId)
      .then((current) => {
        if (current.isLive) setSessionId(saved.sessionId)
        else clearSavedHold()
      })
      .catch((error) => {
        // The API answered (404, 403 for another account): that hold is no
        // use. No answer at all (offline): keep it for the next try.
        if (isAxiosError(error) && error.response) clearSavedHold()
      })
  }, [])

  const openBooking = useCallback(
    (session: Session, movie: Movie) => {
      requireAuth(async () => {
        // Runs right after a login too, before any component has re-rendered
        // with the new user, so read it from the cache rather than a hook.
        const user = await queryClient.ensureQueryData({ queryKey: ["me", getToken()], queryFn: me })

        // The brief: booking needs a complete profile. Ours is a page, not a
        // modal, so send them there; it explains why they arrived.
        if (!user.profileComplete) {
          navigate("/profile", { state: { reason: "booking" } })
          return
        }

        // The card already has everything the header shows, so seed the
        // session query instead of making the modal wait for GET /sessions/{id}.
        queryClient.setQueryData<SessionDetail>(["sessionDetail", session.id], { ...session, movie })
        setSessionId(session.id)
      })
    },
    [requireAuth, queryClient, navigate]
  )

  // Closing without paying gives the seats back at once rather than leaving
  // them blocked for the rest of the 8 minutes (the API docs' advice).
  // Going back from checkout to the map doesn't close, so it keeps the hold.
  const close = () => {
    const holdId = sessionId === null ? null : readSavedHold(sessionId)
    if (holdId) releaseHold(holdId)
    clearSavedHold()
    setSessionId(null)
  }

  const value = useMemo(() => ({ openBooking }), [openBooking])

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingDialog sessionId={sessionId} onClose={close} />
    </BookingContext.Provider>
  )
}
