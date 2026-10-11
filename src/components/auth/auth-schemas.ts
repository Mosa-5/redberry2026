import { z } from "zod"

// Rules from the brief (Login and Registration modals). The
// API enforces the same ones; checking here gives the on-blur feedback the
// brief asks for, and the server still has the last word on uniqueness.

export const email = z.email({
  error: (issue) => (issue.input === "" ? "Email is required" : "Enter a valid email"),
})

const password = z.string().min(1, "Password is required").min(3, "At least 3 characters")

export const loginSchema = z.object({ email, password })

export type LoginValues = z.infer<typeof loginSchema>

/** The formats the API accepts for avatars. */
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"]

const passwords = z.object({
  password,
  confirmPassword: z.string().min(1, "Confirm your password"),
})

export const registerSchema = z
  .object({
    avatar: z
      .instanceof(File)
      .refine((file) => AVATAR_TYPES.includes(file.type), "Upload a JPG, PNG or WEBP image")
      .refine((file) => file.size <= 2 * 1024 * 1024, "The image must be 2MB or smaller")
      .optional(),
    username: z.string().min(1, "Username is required").min(3, "At least 3 characters"),
    email,
  })
  .extend(passwords.shape)
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
    // Object refinements are skipped while any field is invalid, so an
    // untouched username would hide the mismatch. Run it as soon as both
    // password fields are valid on their own.
    when: (payload) => passwords.safeParse(payload.value).success,
  })

export type RegisterValues = z.infer<typeof registerSchema>
