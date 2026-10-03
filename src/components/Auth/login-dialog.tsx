import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { useForm } from "react-hook-form"

import type { ApiError } from "@/API/types"
import { SwitchPrompt } from "@/components/Auth/switch-prompt"
import { loginSchema, type LoginValues } from "@/components/Auth/auth-schemas"
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
import { useLogin } from "@/reactQuery/mutations/auth"

type LoginFormProps = {
  /** Called once signed in — the parent closes the dialog. */
  onSuccess: () => void
  onSwitchToRegister: () => void
}

const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const { mutateAsync: login } = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isValid, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    // Errors appear when a field loses focus, then update as you type.
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values)
      onSuccess()
    } catch (error) {
      // A 401 here is wrong credentials: its message shows in the modal,
      // which stays open with the email still filled in.
      applyServerErrors(error as AxiosError<ApiError>, setError, ["email", "password"])
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-6">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          success={touchedFields.email && !errors.email}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          success={touchedFields.password && !errors.password}
          {...register("password")}
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        {errors.root?.server && (
          <p role="alert" className="type-label-s text-primary">
            {errors.root.server.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
        <SwitchPrompt text="Don't have an account?" action="Sign up" onClick={onSwitchToRegister} />
      </div>
    </form>
  )
}

type LoginDialogProps = LoginFormProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Login modal (Figma 269:4439). */
export const LoginDialog = ({ open, onOpenChange, ...formProps }: LoginDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Creative liberty: the auth modals read small at 1920, so they are
          zoomed 10% past the global scale. zoom scales everything inside
          (inputs, text, icons, radii) and keeps the Figma proportions. */}
      <DialogContent className="w-100.75 [zoom:1.1]">
        <DialogHeader>
          <DialogTitle>Log in</DialogTitle>
          <DialogDescription>Welcome back to Kino XII</DialogDescription>
        </DialogHeader>
        {/* Inside the content so it unmounts on close — each open starts clean. */}
        <LoginForm {...formProps} />
      </DialogContent>
    </Dialog>
  )
}
