import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { setLoginPrompt } from "@/API/reauth"
import { getToken } from "@/API/token"
import { AuthDialogContext, type AuthDialog } from "@/components/Auth/auth-dialog-context"
import { LoginDialog } from "@/components/Auth/login-dialog"
import { RegisterDialog } from "@/components/Auth/register-dialog"

/**
 * Owns the login and sign-up dialogs so anything in the app can open them,
 * not just the header — protected actions, guarded routes and the 401
 * interceptor need to.
 */
export const AuthDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialog, setDialog] = useState<AuthDialog | null>(null)
  // The action that sent the user here. A ref, not state: it's read once
  // after success and never rendered.
  const pending = useRef<(() => void) | null>(null)
  // Set while requests that hit a 401 wait for this login to replay them.
  const relogin = useRef<((loggedIn: boolean) => void) | null>(null)
  // Opened by a 401: the login modal says why it appeared.
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    setLoginPrompt(
      () =>
        new Promise<boolean>((resolve) => {
          relogin.current = resolve
          setExpired(true)
          setDialog("login")
        })
    )
    return () => setLoginPrompt(null)
  }, [])

  const open = useCallback((next: AuthDialog) => setDialog(next), [])

  const requireAuth = useCallback((action: () => void) => {
    if (getToken()) {
      action()
      return
    }
    pending.current = action
    setDialog("login")
  }, [])

  const succeed = () => {
    setDialog(null)
    setExpired(false)
    relogin.current?.(true)
    relogin.current = null
    const action = pending.current
    pending.current = null
    action?.()
  }

  // Closing without signing in abandons the action.
  const close = (isOpen: boolean) => {
    if (isOpen) return
    setDialog(null)
    setExpired(false)
    pending.current = null
    relogin.current?.(false)
    relogin.current = null
  }

  const value = useMemo(() => ({ open, requireAuth }), [open, requireAuth])

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <LoginDialog
        open={dialog === "login"}
        expired={expired}
        onOpenChange={close}
        onSwitchToRegister={() => setDialog("register")}
        onSuccess={succeed}
      />
      <RegisterDialog
        open={dialog === "register"}
        onOpenChange={close}
        onSwitchToLogin={() => setDialog("login")}
        onSuccess={succeed}
      />
    </AuthDialogContext.Provider>
  )
}
