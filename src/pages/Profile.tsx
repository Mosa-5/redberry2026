import { useLocation, useSearchParams } from "react-router"

import type { FilterOptions } from "@/API/types"
import { AgeNotice } from "@/components/Profile/age-notice"
import { PersonalInfoForm } from "@/components/Profile/personal-info-form"
import { ProfileStatus } from "@/components/Profile/profile-status"
import { Skeleton } from "@/components/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetMe } from "@/reactQuery/query/auth"
import { useGetFilterOptions } from "@/reactQuery/query/sessions"

const toAgeRatings = (options: FilterOptions) => options.ageRatings

/** A field's label and 40px box, with the real label text hidden inside for its height. */
const FieldSkeleton = ({ label, hint }: { label: string; hint?: string }) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="w-fit rounded-sm">
          <span className="type-label-s">{label}</span>
        </Skeleton>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      {hint && (
        <Skeleton className="w-fit rounded-sm">
          <span className="type-label-s">{hint}</span>
        </Skeleton>
      )}
    </div>
  )
}

/**
 * Stand-in for the status banner and the form while /me loads, with the
 * form's exact structure and spacing so nothing moves when it arrives. The
 * status mirrors a complete profile (banner + age notice); an incomplete
 * one has no notice, so the form moves up one line when it loads — the
 * status isn't known until /me answers.
 */
const InformationSkeleton = () => {
  return (
    <>
      <div className="flex w-220 flex-col gap-3">
        <Skeleton className="rounded-sm">
          <div className="w-full">
            <ProfileStatus complete />
          </div>
        </Skeleton>
        <Skeleton className="w-fit rounded-sm">
          <p className="type-body-s">You are 28, you can buy tickets for all age ratings.</p>
        </Skeleton>
      </div>
      <div className="flex w-220 flex-col items-start gap-9">
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-4.5">
            <FieldSkeleton label="Full name" />
            <FieldSkeleton label="Email" hint="Set at registration and cannot be changed" />
          </div>
          <div className="flex flex-col gap-5">
            <FieldSkeleton label="Mobile number" />
            <FieldSkeleton label="Date of birth" />
            <FieldSkeleton label="Preferred Venue (Optional)" />
          </div>
        </div>
        {/* The real button, label hidden, so its size can't drift. */}
        <Button asChild className="pointer-events-none animate-pulse bg-raised text-transparent">
          <span aria-hidden>Save changes</span>
        </Button>
      </div>
    </>
  )
}

/**
 * My Profile (Figma 284:13298). The open tab lives in the URL
 * (?tab=tickets), so the navbar's My Tickets link can open it directly and
 * Back moves between tabs.
 */
const Profile = () => {
  const { data: user } = useGetMe()
  const { data: ratings = [] } = useGetFilterOptions({ queryOptions: { select: toAgeRatings } })
  const [searchParams, setSearchParams] = useSearchParams()
  // Set by openBooking when an incomplete profile tried to book.
  const fromBooking = (useLocation().state as { reason?: string } | null)?.reason === "booking"
  const tab = searchParams.get("tab") === "tickets" ? "tickets" : "information"

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => setSearchParams(next === "tickets" ? { tab: "tickets" } : {})}
      className="gap-10.5 px-12.75 pt-29.5 pb-20"
    >
      <div className="flex flex-col gap-7 border-b border-card">
        <h1 className="type-h1 text-foreground">My Profile</h1>
        <TabsList>
          <TabsTrigger value="information">Personal Information</TabsTrigger>
          {/* TODO: the ticket count badge, once tickets are loaded. */}
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="information" className="flex flex-col gap-9">
        {user ? (
          <>
            {/* The brief asks for the status and the age notice on this
                page; Figma doesn't place them, so they sit above the form
                at its width, reusing the dropdown's status banner. */}
            <div className="flex w-220 flex-col gap-3">
              {fromBooking && !user.profileComplete && (
                <p className="type-body-m text-foreground">Complete your profile to book tickets, then pick the session again.</p>
              )}
              <ProfileStatus complete={user.profileComplete} />
              {user.age !== null && <AgeNotice age={user.age} ratings={ratings} />}
            </div>
            <PersonalInfoForm user={user} />
          </>
        ) : (
          <InformationSkeleton />
        )}
      </TabsContent>

      {/* TODO: My Tickets — Upcoming and Past, with refunds. */}
      <TabsContent value="tickets" />
    </Tabs>
  )
}

export default Profile
