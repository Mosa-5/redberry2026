import Check from "@/assets/icons/check.svg?react"

/**
 * Orange "incomplete" or green "complete" banner (Figma "Profile status",
 * inside Profile 355:11311). Shared by the navbar dropdown and the profile
 * page, which the brief asks to show the same status.
 */
export const ProfileStatus = ({ complete }: { complete: boolean }) => {
  if (complete) {
    return (
      <div className="flex items-center gap-1.5 rounded-sm bg-tint-green px-3 py-2.5 type-label-m text-success">
        Profile Complete
        <Check className="size-4" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 rounded-sm bg-tint-warning px-3 py-2.5">
      <p className="type-label-m text-warning">Profile incomplete</p>
      <p className="type-body-s text-muted-foreground">Please complete your profile to enable booking</p>
    </div>
  )
}
