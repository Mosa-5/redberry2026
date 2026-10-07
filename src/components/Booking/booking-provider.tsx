import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { me } from "@/API/requests/Auth"
import { getToken } from "@/API/token"
import type { Movie, Session, SessionDetail } from "@/API/types"
import { useAuthDialog } from "@/components/Auth/auth-dialog-context"
import { BookingContext } from "@/components/Booking/booking-context"
import { BookingDialog } from "@/components/Booking/booking-dialog"

/** Owns the booking modal so the film page and the Sessions page open the same one. */
export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const { requireAuth } = useAuthDialog()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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

  const close = () => setSessionId(null)

  const value = useMemo(() => ({ openBooking }), [openBooking])

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingDialog sessionId={sessionId} onClose={close} />
    </BookingContext.Provider>
  )
}
