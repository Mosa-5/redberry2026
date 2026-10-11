import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { Controller, useForm } from "react-hook-form"

import type { ApiError, FilterOptions, User } from "@/api/types"
import { profileSchema, toProfileValues, type ProfileValues } from "@/components/profile/profile-schema"
import { DateField, FormField, SelectField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { SelectItem } from "@/components/ui/select"
import { yearsAgo } from "@/lib/dates"
import { applyServerErrors } from "@/lib/form-errors"
import { useUpdateProfile } from "@/reactQuery/mutations/auth"
import { useGetFilterOptions } from "@/reactQuery/queries/sessions"

const toVenues = (options: FilterOptions) => options.venues

/** Personal Information form (Figma 284:17136). */
export const PersonalInfoForm = ({ user }: { user: User }) => {
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const { data: venues = [] } = useGetFilterOptions({ queryOptions: { select: toVenues } })

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, touchedFields, isDirty, isValid, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: toProfileValues(user),
  })

  const succeeded = (field: keyof ProfileValues) => !!touchedFields[field] && !errors[field]

  const onSubmit = async ({ preferredVenueId, ...values }: ProfileValues) => {
    try {
      const saved = await updateProfile({
        ...values,
        preferredVenueId: preferredVenueId ? Number(preferredVenueId) : undefined,
      })
      // The saved values become the new baseline, so Save disables again
      // until the next change.
      reset(toProfileValues(saved))
    } catch (error) {
      applyServerErrors(error as AxiosError<ApiError>, setError, [
        "fullName",
        "mobileNumber",
        "dateOfBirth",
        "preferredVenueId",
      ])
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex w-220 flex-col items-start gap-9">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-4.5">
          <FormField
            label="Full name"
            autoComplete="name"
            error={errors.fullName?.message}
            success={succeeded("fullName")}
            {...register("fullName")}
          />
          {/* Display only: not registered, so it's never sent — the API
              ignores email on this endpoint anyway. */}
          <FormField label="Email" value={user.email} disabled hint="Set at registration and cannot be changed" />
        </div>

        <div className="flex flex-col gap-5">
          <FormField
            label="Mobile number"
            type="tel"
            autoComplete="tel-national"
            placeholder="5XX XXX XXX"
            error={errors.mobileNumber?.message}
            success={succeeded("mobileNumber")}
            {...register("mobileNumber")}
          />
          {/* A popover calendar, not a native input, so it goes through a
              Controller. Only dates 12+ years back are pickable — the same
              rule the schema checks. */}
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <DateField
                label="Date of birth"
                placeholder="Select your date of birth"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                max={yearsAgo(12)}
                min={yearsAgo(100)}
                error={errors.dateOfBirth?.message}
                success={succeeded("dateOfBirth")}
              />
            )}
          />
          {/* Radix Select isn't a native input, so it goes through a
              Controller instead of register(). No "none" item: the API
              can't clear a venue once set. */}
          <Controller
            control={control}
            name="preferredVenueId"
            render={({ field }) => (
              <SelectField
                label="Preferred Venue (Optional)"
                placeholder="Select a venue"
                value={field.value}
                onValueChange={field.onChange}
                error={errors.preferredVenueId?.message}
              >
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={String(venue.id)}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectField>
            )}
          />
        </div>
      </div>

      {errors.root?.server && (
        <p role="alert" className="type-label-s text-primary">
          {errors.root.server.message}
        </p>
      )}

      {/* The brief: disabled until something changes and the form is valid. */}
      <Button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
