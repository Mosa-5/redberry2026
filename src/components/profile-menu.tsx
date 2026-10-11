import { cn } from "@/lib/utils"
import { DropdownMenu } from "radix-ui"
import { Link, useMatch, useNavigate } from "react-router"

import type { User } from "@/api/types"
import ChevronDown from "@/assets/icons/chevron-down.svg?react"
import Logout from "@/assets/icons/logout.svg?react"
import Ticket from "@/assets/icons/ticket.svg?react"
import UserIcon from "@/assets/icons/user.svg?react"
import { ProfileStatus } from "@/components/profile/profile-status"
import { UserAvatar } from "@/components/user-avatar"
import { useLogout } from "@/reactQuery/mutations/auth"

/**
 * Menu row (Figma "Profile button", 276:9712); hover fills with bg/card,
 * edge to edge. The default variant's 10px radius has no fill to show it,
 * and the hover variant has none, so the rows are square.
 */
const itemClass =
  "flex w-full cursor-pointer items-center gap-2 pl-5 type-label-m outline-none data-highlighted:bg-card"

/**
 * The signed-in half of the navbar: avatar, first name and a dropdown
 * (Figma Navbar Authorized 240:1398, Profile 355:11311).
 */
export const ProfileMenu = ({ user }: { user: User }) => {
  const logout = useLogout()
  const navigate = useNavigate()
  const onProfile = useMatch("/profile/*")
  const firstName = user.fullName?.split(/\s+/)[0] ?? user.username

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="group flex items-center gap-6 outline-none">
        <span className="flex items-center gap-3">
          <UserAvatar user={user} />
          <span className="type-label-m text-foreground">{firstName}</span>
        </span>
        <ChevronDown className="size-4 text-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/* Right edge lines up with the trigger, 6px below it, as placed on
            the Home screen. Figma (355:11312) has no border or shadow —
            checked by sampling the rendered edge, which is bg/page. */}
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          // Same fade as the search panel: the `reveal` keyframes from
          // index.css, 150ms ease-out, without the search's delay.
          className="z-50 flex w-75.5 flex-col gap-1 overflow-hidden rounded-lg bg-popover pb-2.5 data-[state=open]:animate-[reveal_150ms_ease-out]"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pt-5 pl-5">
              <UserAvatar user={user} className="size-10.5" />
              <div className="flex w-47.5 flex-col gap-0.5">
                <p className="truncate type-label-m text-foreground">{user.fullName ?? user.username}</p>
                <p className="truncate type-body-s text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="px-5">
              <ProfileStatus complete={user.profileComplete} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-0.5 pt-1">
              <DropdownMenu.Item asChild>
                <Link to="/profile" className={cn(itemClass, "h-10 text-foreground")}>
                  <UserIcon className="size-4" />
                  My Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/profile?tab=tickets" className={cn(itemClass, "h-10 text-foreground")}>
                  <Ticket className="size-4" />
                  My Tickets
                </Link>
              </DropdownMenu.Item>
            </div>
            <DropdownMenu.Separator className="h-px bg-tint-white" />
            <DropdownMenu.Item
              // No fixed height in Figma, unlike the links above: 10px
              // padding makes it 36px.
              className={cn(itemClass, "py-2.5 text-primary")}
              disabled={logout.isPending}
              onSelect={() => {
                // Leave signed-in pages first, or their guard would read the
                // cleared token as an expired session and open the login modal.
                if (onProfile) navigate("/")
                logout.mutate()
              }}
            >
              <Logout className="size-4" />
              Log out
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
