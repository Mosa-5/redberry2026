import { useCallback, useMemo, useRef, useState } from "react"

import { getToken } from "@/API/token"
import { AuthDialogContext, type AuthDialog } from "@/components/Auth/auth-dialog-context"
import { LoginDialog } from "@/components/Auth/login-dialog"
import { RegisterDialog } from "@/components/Auth/register-dialog"

/**
 * Owns the login and sign-up dialogs so anything in the app can open them,
 * not just the header — protected actions and guarded routes need to.
 */
export const AuthDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialog, setDialog] = useState<AuthDialog | null>(null)
  // The action that sent the user here. A ref, not state: it's read once
  // after success and never rendered.
  const pending = useRef<(() => void) | null>(null)

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
    const action = pending.current
    pending.current = null
    action?.()
  }

  // Closing without signing in abandons the action.
  const close = (isOpen: boolean) => {
    if (isOpen) return
    setDialog(null)
    pending.current = null
  }

  const value = useMemo(() => ({ open, requireAuth }), [open, requireAuth])

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <LoginDialog
        open={dialog === "login"}
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
