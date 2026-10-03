import { cn } from "cn"

import type { User } from "@/API/types"
import StatusComplete from "@/assets/icons/status-complete.svg?react"
import StatusIncomplete from "@/assets/icons/status-incomplete.svg?react"

/** "Meri Sanikidze" → "MS". Before the profile has a name, the username's first letter. */
const initials = (user: User) => {
  if (!user.fullName) return user.username.charAt(0).toUpperCase()
  return user.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

/**
 * Avatar (Figma 269:9467): the photo, or initials on bg/card when there is
 * none. The corner dot is the profile status the API docs point at:
 * orange while incomplete (booking blocked), green once complete.
 */
export const UserAvatar = ({ user, className }: { user: User; className?: string }) => {
  const Status = user.profileComplete ? StatusComplete : StatusIncomplete

  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-xs bg-card type-label-s text-foreground",
        className
      )}
    >
      {user.avatar ? (
        <img src={user.avatar} alt="" className="size-full rounded-xs object-cover" />
      ) : (
        initials(user)
      )}
      {/* The dot is 8px with a 1px page-coloured ring, so the 10px SVG sits
          1px outside the corner. */}
      <Status className="absolute -right-px -bottom-px size-2.5" />
    </span>
  )
}
