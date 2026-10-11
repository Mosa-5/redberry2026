// The 401 interceptor lives outside React and the login modal inside it.
// AuthDialogProvider registers how to ask for a login; the interceptor
// waits on that before replaying a request that came back 401.

type AskForLogin = () => Promise<boolean>

let askForLogin: AskForLogin | null = null
let waiting: Promise<boolean> | null = null

export const setLoginPrompt = (prompt: AskForLogin | null) => {
  askForLogin = prompt
}

/**
 * True once the user has logged in again, false if they closed the modal.
 * Requests that fail together share one prompt and all replay after it.
 */
export const waitForLogin = () => {
  if (!askForLogin) return Promise.resolve(false)
  waiting ??= askForLogin().finally(() => {
    waiting = null
  })
  return waiting
}
