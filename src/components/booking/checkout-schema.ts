import { z } from "zod"

import type { User } from "@/api/types"
import { email } from "@/components/auth/auth-schemas"
import { formatMobile, profileSchema } from "@/components/profile/profile-schema"

// The brief's checkout rules (Step 2: Checkout). Name, email and mobile
// reuse the profile and registration rules and messages, since the fields
// are prefilled from the account.
// The brief gives no wording for the card fields; these are ours. The API
// strips spaces from the card and mobile numbers, so either form is fine.

const digits = (value: string) => value.replace(/\s/g, "")

/** "MM/YY" for a month that hasn't ended yet. A card is valid through its expiry month. */
const notExpired = (value: string) => {
  const [month, year] = value.split("/").map(Number)
  return new Date(2000 + year, month, 1) > new Date()
}

export const checkoutSchema = z.object({
  fullName: profileSchema.shape.fullName,
  email,
  mobileNumber: profileSchema.shape.mobileNumber,
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .refine((value) => /^\d{16}$/.test(digits(value)), "Card number must be 16 digits"),
  expiry: z
    .string()
    .min(1, "Expiry is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use the MM/YY format")
    .refine(notExpired, "This card has expired"),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .regex(/^\d{3}$/, "CVV must be 3 digits"),
})

export type CheckoutValues = z.infer<typeof checkoutSchema>

/** The brief: name, email and mobile come prefilled from the profile. */
export const toCheckoutValues = (user: User): CheckoutValues => ({
  fullName: user.fullName ?? "",
  email: user.email,
  mobileNumber: user.mobileNumber ? formatMobile(user.mobileNumber) : "",
  cardNumber: "",
  expiry: "",
  cvv: "",
})
