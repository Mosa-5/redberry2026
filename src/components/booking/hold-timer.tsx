import { useEffect, useEffectEvent, useState } from "react"

const secondsUntil = (expiresAt: string) => Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000))

/** 467 → "7:47" */
const formatClock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

/**
 * "SEATS HELD 7:48" (Figma 243:1587). Counts down to the API's expiresAt —
 * re-read from the clock every tick rather than decremented, so a slow or
 * backgrounded tab can't drift (the docs' advice). Calls onExpire once at 0.
 * Key it by holdId so a new hold starts a fresh timer.
 */
export const HoldTimer = ({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) => {
  const [seconds, setSeconds] = useState(() => secondsUntil(expiresAt))
  // The latest onExpire without restarting the interval when it changes.
  const expire = useEffectEvent(onExpire)

  useEffect(() => {
    const id = setInterval(() => {
      const left = secondsUntil(expiresAt)
      setSeconds(left)
      if (left === 0) {
        clearInterval(id)
        expire()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return (
    <div role="timer" className="flex shrink-0 flex-col items-center gap-0.5 rounded-md bg-card px-3.5 py-2">
      <span className="type-label-s text-muted-foreground uppercase">Seats held</span>
      <span className="type-button text-foreground">{formatClock(seconds)}</span>
    </div>
  )
}
