import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"

import type { ApiError } from "@/API/types"
import Upload from "@/assets/icons/upload.svg?react"
import { SwitchPrompt } from "@/components/Auth/switch-prompt"
import { AVATAR_TYPES, registerSchema, type RegisterValues } from "@/components/Auth/auth-schemas"
import { FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { applyServerErrors } from "@/lib/form-errors"
import { useRegister } from "@/reactQuery/mutations/auth"

type AvatarFieldProps = {
  error?: string
  onSelect: (file: File | undefined) => void
}

/** Optional avatar picker with a preview of the chosen image. */
const AvatarField = ({ error, onSelect }: AvatarFieldProps) => {
  const [preview, setPreview] = useState<string>()

  // Object URLs hold the file in memory until revoked: release the old one
  // whenever the preview changes, and the last one on unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  return (
    <div className="flex flex-col gap-2">
      <label className="flex w-fit cursor-pointer items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center overflow-hidden rounded-xs",
            !preview && "border-[0.5px] border-dashed border-raised bg-tint-white"
          )}
        >
          {preview ? <img src={preview} alt="" className="size-full object-cover" /> : <Upload />}
        </span>
        <span className="flex flex-col gap-0.75">
          <span className="type-button text-foreground">Upload avatar (optional)</span>
          <span className="type-body-s text-muted-foreground">JPG, PNG or WEBP</span>
        </span>
        <input
          type="file"
          accept={AVATAR_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            onSelect(file)
            // A file of the wrong type gets the error, not a broken preview.
            setPreview(file && AVATAR_TYPES.includes(file.type) ? URL.createObjectURL(file) : undefined)
          }}
        />
      </label>
      {error && <p className="type-label-s text-primary">{error}</p>}
    </div>
  )
}

type RegisterFormProps = {
  /** Called once the account exists — registering also signs in. */
  onSuccess: () => void
  onSwitchToLogin: () => void
}

const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const { mutateAsync: signUp } = useRegister()
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async ({ confirmPassword, ...values }: RegisterValues) => {
    try {
      await signUp({ ...values, passwordConfirmation: confirmPassword })
      onSuccess()
    } catch (error) {
      // "Already taken" for username or email arrives as a 422 and lands on
      // that field, as the brief requires.
      applyServerErrors(
        error as AxiosError<ApiError>,
        setError,
        ["avatar", "username", "email", "password", "confirmPassword"],
        { password_confirmation: "confirmPassword" }
      )
    }
  }

  const succeeded = (field: keyof RegisterValues) => !!touchedFields[field] && !errors[field]

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8"
    >
      <AvatarField
        error={errors.avatar?.message}
        onSelect={(file) => setValue("avatar", file, { shouldValidate: true })}
      />

      <div className="flex flex-col gap-6">
        <FormField
          label="Username"
          autoComplete="username"
          placeholder="User"
          error={errors.username?.message}
          success={succeeded("username")}
          {...register("username")}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          success={succeeded("email")}
          {...register("email")}
        />
        <div className="flex gap-3">
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            success={succeeded("password")}
            // Changing the password re-checks the confirmation against it.
            {...register("password", { deps: "confirmPassword" })}
          />
          <FormField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            success={succeeded("confirmPassword")}
            {...register("confirmPassword")}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        {errors.root?.server && (
          <p role="alert" className="type-label-s text-primary">
            {errors.root.server.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Signing up…" : "Sign up"}
        </Button>
        <SwitchPrompt text="Already have an account?" action="Log in" onClick={onSwitchToLogin} />
      </div>
    </form>
  )
}

type RegisterDialogProps = RegisterFormProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Registration modal (Figma 269:4543). */
export const RegisterDialog = ({ open, onOpenChange, ...formProps }: RegisterDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Zoomed 10% like the login modal — see login-dialog.tsx. */}
      <DialogContent className="w-118.75 [zoom:1.1]">
        <DialogHeader>
          <DialogTitle>Sign up</DialogTitle>
          <DialogDescription>Welcome to Kino XII</DialogDescription>
        </DialogHeader>
        <RegisterForm {...formProps} />
      </DialogContent>
    </Dialog>
  )
}
