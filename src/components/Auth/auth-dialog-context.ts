import { createContext, useContext } from "react"

export type AuthDialog = "login" | "register"

export type AuthDialogContextValue = {
  open: (dialog: AuthDialog) => void
  /**
   * Runs `action` straight away when signed in. Otherwise opens the login
   * modal and runs it after a successful login or sign-up, so the user
   * never has to click twice (the brief's rule for protected actions).
   */
  requireAuth: (action: () => void) => void
}

export const AuthDialogContext = createContext<AuthDialogContextValue | null>(null)

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext)
  if (!context) throw new Error("useAuthDialog must be used inside AuthDialogProvider")
  return context
}
