import { useEffect, useState } from "react"

/** Returns `value` once it has stopped changing for `delay` ms. */
export const useDebounce = <T>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
