import { useEffect } from "react"
import { Navigate, Outlet, useLocation, useNavigate } from "react-router"

import { useAuthDialog } from "@/components/Auth/auth-dialog-context"
import { useToken } from "@/hooks/use-token"

/**
 * Route guard for signed-in pages. A guest is sent home with the login
 * modal open, and brought back here once they sign in — the brief's
 * "unauthorised click opens the auth modal". Also covers a token expiring
 * while on the page: the 401 interceptor clears it and this takes over.
 */
export const AuthGuard = () => {
  const token = useToken()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { requireAuth } = useAuthDialog()

  useEffect(() => {
    if (!token) requireAuth(() => navigate(pathname))
  }, [token, requireAuth, navigate, pathname])

  if (!token) return <Navigate to="/" replace />
  return <Outlet />
}
