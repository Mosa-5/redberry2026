import { cn } from "@/lib/utils"

/** Pill badge (Figma Badge, 108:2079) — colours come from the caller. */
export const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <span className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 type-label-s", className)}>{children}</span>
  )
}
