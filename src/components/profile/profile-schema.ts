import { z } from "zod"

import type { User } from "@/api/types"
import { toIsoDate, yearsAgo } from "@/lib/dates"

// Rules and messages word for word from the brief (Personal
// Information). The API returns the same strings, so client and
// server errors read the same.

/** The API strips spaces, so "599 123 456" and "599123456" are both fine. */
const digits = (value: string) => value.replace(/\s/g, "")

// Checks run in order and the field shows the first one that fails, so the
// most basic problem is reported first.
export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),
  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .refine(
      (value) => /^\d+$/.test(digits(value)),
      "Please enter a valid Georgian mobile number (9 digits starting with 5)"
    )
    .refine((value) => digits(value).startsWith("5"), "Georgian mobile numbers must start with 5")
    .refine((value) => digits(value).length === 9, "Mobile number must be exactly 9 digits"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => value <= toIsoDate(new Date()), "Please enter a valid date of birth")
    .refine((value) => value <= toIsoDate(yearsAgo(12)), "You must be at least 12 years old to create an account"),
  /** Venue id as a string, "" when none has been picked. */
  preferredVenueId: z.string(),
})

export type ProfileValues = z.infer<typeof profileSchema>

/** "599123456" → "599 123 456", the way the design shows it. */
export const formatMobile = (value: string) => value.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3")

export const toProfileValues = (user: User): ProfileValues => ({
  fullName: user.fullName ?? "",
  mobileNumber: user.mobileNumber ? formatMobile(user.mobileNumber) : "",
  dateOfBirth: user.dateOfBirth ?? "",
  preferredVenueId: user.preferredVenue ? String(user.preferredVenue.id) : "",
})

