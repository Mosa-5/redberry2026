import type { AxiosError } from "axios"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import type { ApiError } from "@/API/types"

/**
 * Puts a failed request's message where the user will see it, following
 * the API docs' error table: a 422 with `errors` goes onto each field, any
 * other 4xx `message` is already written for the user and goes to
 * `root.server`, and anything else gets a generic retry message.
 *
 * `rename` maps API keys to form fields where they differ
 * (`password_confirmation` → `confirmPassword`).
 */
export const applyServerErrors = <T extends FieldValues>(
  error: AxiosError<ApiError>,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  rename: Record<string, Path<T>> = {}
) => {
  const status = error.response?.status
  const data = error.response?.data

  if (status === 422 && data?.errors) {
    let focused = false
    Object.entries(data.errors).forEach(([key, messages]) => {
      const field = rename[key] ?? (key as Path<T>)
      if (fields.includes(field)) {
        setError(field, { type: "server", message: messages[0] }, { shouldFocus: !focused })
        focused = true
      } else {
        setError("root.server", { type: "server", message: messages[0] })
      }
    })
    return
  }

  if (status && status < 500 && data?.message) {
    setError("root.server", { type: "server", message: data.message })
    return
  }

  setError("root.server", { type: "server", message: "Something went wrong. Please try again." })
}
