import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { useForm } from "react-hook-form"

import type { Order, User } from "@/API/types"
import type { OrderInput } from "@/API/requests/Booking"
import { checkoutSchema, toCheckoutValues, type CheckoutValues } from "@/components/Booking/checkout-schema"
import { FormField } from "@/components/form-field"
import { applyServerErrors } from "@/lib/form-errors"
import type { SeatConflict } from "@/reactQuery/mutations/booking"

export const CHECKOUT_FORM_ID = "checkout-form"

const FIELDS = ["fullName", "email", "mobileNumber", "cardNumber", "expiry", "cvv"] as const

type CheckoutFormProps = {
  user: User
  holdId: string
  /** useCreateOrder's mutateAsync; the flow owns the mutation so the Pay button can show its state. */
  createOrder: (input: OrderInput) => Promise<Order>
  onPaid: (order: Order) => void
  /** 409: someone else's checkout sold one of the seats first. */
  onConflict: (contested: string[]) => void
  /** 422 without field errors: the hold ran out before paying. */
  onExpired: () => void
}

/**
 * Buyer and card details (Figma Checkout, 265:3955 / 265:3953). The Pay
 * button sits in the summary column, so it submits this form by its id.
 */
export const CheckoutForm = ({ user, holdId, createOrder, onPaid, onConflict, onExpired }: CheckoutFormProps) => {
  const defaults = toCheckoutValues(user)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: defaults,
  })

  // Figma shows the prefilled fields already checked; the rest earn the
  // check once touched and valid.
  const succeeded = (field: keyof CheckoutValues) =>
    !errors[field] && (!!touchedFields[field] || defaults[field] !== "")

  const onSubmit = async (values: CheckoutValues) => {
    try {
      onPaid(await createOrder({ holdId, ...values }))
    } catch (error) {
      if (!isAxiosError<SeatConflict>(error) || !error.response) {
        setError("root.server", { message: "Couldn't complete the order. Check your connection and try again." })
        return
      }
      const { status, data } = error.response
      // The API docs: a 422 with only a message means the hold ran out.
      if (status === 422 && !data.errors) {
        onExpired()
        return
      }
      if (status === 409) {
        onConflict(data.contested ?? [])
        return
      }
      // A 401 is handled by logging out; nothing to show here.
      if (status === 401) return
      applyServerErrors(error, setError, FIELDS)
    }
  }

  return (
    <form id={CHECKOUT_FORM_ID} noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-6">
      <div className="flex flex-col gap-6">
        <FormField
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          success={succeeded("fullName")}
          {...register("fullName")}
        />
        <div className="flex gap-3">
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            success={succeeded("email")}
            {...register("email")}
          />
          <FormField
            label="Mobile number"
            type="tel"
            autoComplete="tel-national"
            placeholder="5XX XXX XXX"
            error={errors.mobileNumber?.message}
            success={succeeded("mobileNumber")}
            {...register("mobileNumber")}
          />
        </div>
      </div>

      <div className="h-px rounded-full bg-card" />

      <div className="flex flex-col gap-6">
        <FormField
          label="Card number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="e.g. 1234 4567 8901 2345"
          maxLength={19}
          error={errors.cardNumber?.message}
          success={succeeded("cardNumber")}
          {...register("cardNumber")}
        />
        <div className="flex gap-3">
          <FormField
            label="Expiry"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="e.g. 12/34"
            maxLength={5}
            error={errors.expiry?.message}
            success={succeeded("expiry")}
            {...register("expiry")}
          />
          <FormField
            label="CVV"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="e.g. 123"
            maxLength={3}
            error={errors.cvv?.message}
            success={succeeded("cvv")}
            {...register("cvv")}
          />
        </div>
      </div>

      {errors.root?.server && (
        <p role="alert" className="type-label-s text-primary">
          {errors.root.server.message}
        </p>
      )}
    </form>
  )
}
